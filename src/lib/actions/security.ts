'use server';

import { db } from '@/db';
import { securityScans } from '@/db/schema';
import { auth } from '@/auth';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Запуск задачи безопасности через воркер.
 * Использует прокси для обеспечения безопасности и обхода CORS/Mixed Content.
 */
export async function runSecurityAction(type: string, method: string, target: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    // Вызов воркера через системный эндпоинт
    const response = await fetch(`http://31.76.34.252:4000/api/run/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
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

    // Сохраняем задачу в локальной БД фронтенда для истории
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
 * Синхронизация статусов активных задач между воркером и локальной БД.
 * Сопоставляет Snake Case от воркера с Camel Case в Drizzle.
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
        const response = await fetch(`http://31.76.34.252:4000/api/status/${scan.id}`, { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-store', 'Pragma': 'no-cache' }
        });
        
        if (response.ok) {
          const remoteData = await response.json();
          const remoteStatus = remoteData.status?.toLowerCase();
          
          if (remoteStatus !== 'in_progress' && remoteStatus !== 'running' && remoteStatus !== 'scan started') {
            await db.update(securityScans)
              .set({ 
                status: remoteStatus, 
                resultSummary: remoteData.result_summary || remoteData.resultSummary, 
                reportPath: remoteData.report_path || remoteData.reportPath 
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
    await fetch(`http://31.76.34.252:4000/api/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ scan_id: scanId }),
      cache: 'no-store'
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

  // Выполняем синхронизацию перед возвратом истории
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
