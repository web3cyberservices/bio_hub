
'use server';

import { db } from '@/db';
import { securityScans } from '@/db/schema';
import { auth } from '@/auth';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const ENGINE_API_URL = process.env.ENGINE_API_URL || 'http://31.76.34.252:4000';

/**
 * Запуск ИБ-действия через Engine API.
 */
export async function runSecurityAction(type: 'pentest' | 'osint', method: string, target: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    // 1. Создаем запись в БД о начале сканирования
    const [scan] = await db.insert(securityScans).values({
      userId: session.user.id,
      target,
      type,
      method,
      status: 'in_progress'
    }).returning();

    const endpoint = `/api/run/${method}`;
    
    // 2. Отправляем запрос на Engine Worker
    // Используем non-blocking fetch для асинхронного запуска на воркере
    fetch(`${ENGINE_API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, scan_id: scan.id })
    }).catch(err => console.error('Engine async trigger failed:', err));

    revalidatePath('/dashboard/security');
    return { success: true, scanId: scan.id };
  } catch (err) {
    console.error('Security Action Error:', err);
    return { error: 'Internal system error' };
  }
}

/**
 * Остановка активного сканирования.
 */
export async function stopSecurityAction(scanId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    const response = await fetch(`${ENGINE_API_URL}/api/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scan_id: scanId })
    });

    if (response.ok) {
      await db.update(securityScans)
        .set({ 
          status: 'failed', 
          resultSummary: 'Terminated by user signal at ' + new Date().toISOString() 
        })
        .where(eq(securityScans.id, scanId));
      revalidatePath('/dashboard/security');
      return { success: true };
    }
    return { error: 'Failed to stop scan' };
  } catch (err) {
    return { error: 'Connection error' };
  }
}

/**
 * Удаление записи о сканировании.
 */
export async function deleteSecurityAction(scanId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    await db.delete(securityScans).where(eq(securityScans.id, scanId));
    revalidatePath('/dashboard/security');
    return { success: true };
  } catch (err) {
    return { error: 'Failed to delete record' };
  }
}

/**
 * Получение истории сканирований пользователя.
 */
export async function getScanHistory() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    return db.select()
      .from(securityScans)
      .where(eq(securityScans.userId, session.user.id))
      .orderBy(desc(securityScans.timestamp))
      .limit(50);
  } catch (err) {
    console.error('DB Fetch Error:', err);
    return [];
  }
}

/**
 * Проверка статуса Engine API.
 */
export async function getEngineStatus() {
  try {
    const start = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${ENGINE_API_URL}/health`, { 
      cache: 'no-store',
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);
    const latency = Date.now() - start;
    
    return {
      online: response.ok,
      latency: `${latency}ms`,
      version: 'v2.4.0-stable'
    };
  } catch (e) {
    return { online: false, latency: 'N/A', version: 'Unknown' };
  }
}
