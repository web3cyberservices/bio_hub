
'use server';

import { db } from '@/db';
import { securityScans } from '@/db/schema';
import { auth } from '@/auth';
import { eq, desc, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const ENGINE_API_URL = process.env.ENGINE_API_URL || 'http://31.76.34.252:4000';

/**
 * Запуск задачи безопасности.
 */
export async function runSecurityAction(type: string, method: string, target: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    // 1. Создаем запись в локальной БД фронтенда
    const [scan] = await db.insert(securityScans).values({
      userId: session.user.id,
      target,
      type,
      method,
      status: 'in_progress',
      timestamp: new Date().toISOString()
    }).returning();

    // 2. Отправляем команду воркеру
    try {
      const response = await fetch(`${ENGINE_API_URL}/api/run/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, scan_id: scan.id }),
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Engine rejected request: ${response.status}`);
      }
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
 * Синхронизация статусов активных задач (Поллинг).
 */
export async function syncActiveScans() {
  const session = await auth();
  if (!session?.user?.id) return;

  try {
    const activeScans = await db.select()
      .from(securityScans)
      .where(eq(securityScans.status, 'in_progress'))
      .limit(20);

    if (activeScans.length === 0) return;

    for (const scan of activeScans) {
      try {
        const response = await fetch(`${ENGINE_API_URL}/api/status/${scan.id}`, { 
          cache: 'no-store',
          signal: AbortSignal.timeout(3000)
        });

        if (response.ok) {
          const remoteData = await response.json();
          // Если статус на воркере изменился, обновляем нашу БД
          if (remoteData.status && remoteData.status !== 'in_progress') {
            await db.update(securityScans)
              .set({ 
                status: remoteData.status, 
                resultSummary: remoteData.resultSummary || 'No summary provided', 
                reportPath: remoteData.reportPath 
              })
              .where(eq(securityScans.id, scan.id));
          }
        }
      } catch (e) {
        // Ошибка связи с воркером для конкретной задачи - пропускаем до следующего цикла
      }
    }
    revalidatePath('/dashboard/security');
  } catch (err) {
    console.error('Sync Error:', err);
  }
}

export async function stopSecurityAction(scanId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    const response = await fetch(`${ENGINE_API_URL}/api/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scan_id: scanId }),
      cache: 'no-store'
    });

    if (response.ok) {
      await db.update(securityScans)
        .set({ status: 'failed', resultSummary: 'Terminated by operator.' })
        .where(eq(securityScans.id, scanId));
      revalidatePath('/dashboard/security');
      return { success: true };
    }
  } catch (err) {}
  return { error: 'Stop signal failed' };
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

  // Выполняем синхронизацию перед загрузкой истории
  await syncActiveScans();

  try {
    return await db.select()
      .from(securityScans)
      .where(eq(securityScans.userId, session.user.id))
      .orderBy(desc(securityScans.timestamp))
      .limit(50);
  } catch (err) {
    return [];
  }
}

export async function getEngineStatus() {
  try {
    const start = Date.now();
    // Делаем запрос через прокси или напрямую (Server-side fetch всегда разрешен)
    const response = await fetch(`${ENGINE_API_URL}/health`, { 
      cache: 'no-store',
      signal: AbortSignal.timeout(2000)
    });
    
    if (!response.ok) throw new Error();
    
    const latency = Date.now() - start;
    return { online: true, latency: `${latency}ms` };
  } catch (e) {
    return { online: false, latency: 'N/A' };
  }
}
