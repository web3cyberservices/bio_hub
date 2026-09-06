
'use server';

import { db } from '@/db';
import { securityScans } from '@/db/schema';
import { auth } from '@/auth';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const ENGINE_API_URL = process.env.ENGINE_API_URL || 'http://31.76.34.252:4000';

/**
 * Запуск задачи безопасности.
 * Вызывает воркер, получает числовой ID и сохраняет его в локальную БД.
 */
export async function runSecurityAction(type: string, method: string, target: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    // 1. Отправляем команду воркеру напрямую (Server-to-Server)
    const response = await fetch(`${ENGINE_API_URL}/api/run/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target }),
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Worker response was not OK');
    }

    const workerRes = await response.json();
    const numericId = workerRes.id;

    if (!numericId) {
      throw new Error('Worker did not return an ID');
    }

    // 2. Создаем запись в локальной БД, используя ID от воркера
    await db.insert(securityScans).values({
      id: String(numericId),
      userId: session.user.id,
      target,
      type,
      method,
      status: 'in_progress',
      timestamp: new Date().toISOString()
    });

    revalidatePath('/dashboard/security');
    return { success: true, scanId: String(numericId) };
  } catch (err) {
    console.error('Security Action Error:', err);
    return { error: 'Internal System Error: Could not start task on worker.' };
  }
}

/**
 * Синхронизация статусов (Server-side опрос).
 * Обновляет локальную БД информацией от воркера.
 */
export async function syncActiveScans() {
  const session = await auth();
  if (!session?.user?.id) return;

  try {
    const activeScans = await db.select()
      .from(securityScans)
      .where(eq(securityScans.status, 'in_progress'))
      .limit(20);

    for (const scan of activeScans) {
      try {
        const response = await fetch(`${ENGINE_API_URL}/api/status/${scan.id}`, { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-store' }
        });
        
        if (response.ok) {
          const remoteData = await response.json();
          // Если статус изменился, обновляем локальную запись
          if (remoteData.status !== 'in_progress' && remoteData.status !== 'Scan started') {
            await db.update(securityScans)
              .set({ 
                status: remoteData.status, 
                resultSummary: remoteData.resultSummary, 
                reportPath: remoteData.reportPath 
              })
              .where(eq(securityScans.id, scan.id));
          }
        }
      } catch (e) {
        console.error(`Status sync failed for task ${scan.id}:`, e);
      }
    }
  } catch (err) {
    console.error('Global status sync failed:', err);
  }
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

  // Запускаем фоновую синхронизацию перед возвратом истории
  await syncActiveScans();

  try {
    return await db.select()
      .from(securityScans)
      .where(eq(securityScans.userId, session.user.id))
      .orderBy(desc(securityScans.timestamp))
      .limit(30);
  } catch (err) {
    console.error('History fetch failed:', err);
    return [];
  }
}
