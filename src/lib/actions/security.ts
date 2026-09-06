
'use server';

import { db } from '@/db';
import { securityScans } from '@/db/schema';
import { auth } from '@/auth';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const ENGINE_API_URL = process.env.ENGINE_API_URL || 'http://31.76.34.252:4000';

/**
 * Запуск задачи безопасности.
 */
export async function runSecurityAction(type: string, method: string, target: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    const [scan] = await db.insert(securityScans).values({
      userId: session.user.id,
      target,
      type,
      method,
      status: 'in_progress',
      timestamp: new Date().toISOString()
    }).returning();

    // Отправляем команду воркеру
    try {
      await fetch(`${ENGINE_API_URL}/api/run/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, scan_id: scan.id }),
        cache: 'no-store'
      });
    } catch (fetchErr) {
      console.error('Fetch to worker failed:', fetchErr);
      await db.update(securityScans)
        .set({ status: 'failed', resultSummary: 'ENGINE_OFFLINE: Could not reach worker node.' })
        .where(eq(securityScans.id, scan.id));
    }

    revalidatePath('/dashboard/security');
    return { success: true, scanId: scan.id };
  } catch (err) {
    console.error('Security Action Error:', err);
    return { error: 'Internal System Error' };
  }
}

/**
 * Синхронизация статусов (Server-side опрос для обновления БД).
 * Вызывается при загрузке страницы.
 */
export async function syncActiveScans() {
  const session = await auth();
  if (!session?.user?.id) return;

  try {
    const activeScans = await db.select()
      .from(securityScans)
      .where(eq(securityScans.status, 'in_progress'))
      .limit(10);

    for (const scan of activeScans) {
      try {
        const response = await fetch(`${ENGINE_API_URL}/api/status/${scan.id}`, { cache: 'no-store' });
        if (response.ok) {
          const remoteData = await response.json();
          if (remoteData.status !== 'in_progress') {
            await db.update(securityScans)
              .set({ 
                status: remoteData.status, 
                resultSummary: remoteData.resultSummary, 
                reportPath: remoteData.reportPath 
              })
              .where(eq(securityScans.id, scan.id));
          }
        }
      } catch (e) {}
    }
  } catch (err) {}
}

export async function stopSecurityAction(scanId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    await fetch(`${ENGINE_API_URL}/api/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scan_id: scanId }),
    });

    await db.update(securityScans)
      .set({ status: 'failed', resultSummary: 'Terminated by operator.' })
      .where(eq(securityScans.id, scanId));
    
    revalidatePath('/dashboard/security');
    return { success: true };
  } catch (err) {
    return { error: 'Stop failed' };
  }
}

export async function deleteSecurityAction(scanId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    await db.delete(securityScans).where(eq(securityScans.id, scanId));
    revalidatePath('/dashboard/security');
    return { success: true };
  } catch (err) {
    return { error: 'Delete failed' };
  }
}

export async function getScanHistory() {
  const session = await auth();
  if (!session?.user?.id) return [];

  // Выполняем синхронизацию при каждом запросе истории
  await syncActiveScans();

  try {
    return await db.select()
      .from(securityScans)
      .where(eq(securityScans.userId, session.user.id))
      .orderBy(desc(securityScans.timestamp))
      .limit(30);
  } catch (err) {
    return [];
  }
}
