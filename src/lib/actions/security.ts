
'use server';

import { db } from '@/db';
import { securityScans } from '@/db/schema';
import { auth } from '@/auth';
import { eq, desc } from 'drizzle-orm';

const ENGINE_API_URL = process.env.ENGINE_API_URL || 'http://31.76.34.252:4000';

export async function runSecurityAction(type: 'pentest' | 'osint', method: string, target: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    // 1. Создаем запись в локальной БД
    const [scan] = await db.insert(securityScans).values({
      userId: session.user.id,
      target,
      type,
      method,
      status: 'in_progress'
    }).returning();

    // 2. Отправляем запрос на Engine API
    const endpoint = type === 'pentest' ? `/api/run/${method}` : `/api/osint/${method}`;
    
    // В реальном сценарии здесь может быть асинхронный запуск, мы имитируем вызов
    const response = await fetch(`${ENGINE_API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, scan_id: scan.id })
    });

    if (!response.ok) {
      await db.update(securityScans)
        .set({ status: 'failed', resultSummary: 'Engine API connection error' })
        .where(eq(securityScans.id, scan.id));
      return { error: 'Engine reported an error' };
    }

    return { success: true, scanId: scan.id };
  } catch (err) {
    console.error('Security Action Error:', err);
    return { error: 'Internal system error' };
  }
}

export async function getScanHistory() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.select()
    .from(securityScans)
    .where(eq(securityScans.userId, session.user.id))
    .orderBy(desc(securityScans.timestamp))
    .limit(20);
}

export async function getEngineStatus() {
  try {
    const start = Date.now();
    const response = await fetch(`${ENGINE_API_URL}/health`, { cache: 'no-store' });
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
