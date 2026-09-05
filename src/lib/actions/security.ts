
'use server';

import { db } from '@/db';
import { securityScans } from '@/db/schema';
import { auth } from '@/auth';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const ENGINE_API_URL = process.env.ENGINE_API_URL || 'http://31.76.34.252:4000';

export async function runSecurityAction(type: string, method: string, target: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    // 1. Create local record first
    const [scan] = await db.insert(securityScans).values({
      userId: session.user.id,
      target,
      type,
      method,
      status: 'in_progress',
      timestamp: new Date().toISOString()
    }).returning();

    // 2. Trigger remote worker
    try {
      const response = await fetch(`${ENGINE_API_URL}/api/run/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, scan_id: scan.id }),
        cache: 'no-store'
      });

      if (!response.ok) throw new Error('Engine not responding');
    } catch (fetchErr) {
      // Update status if remote trigger fails
      await db.update(securityScans)
        .set({ status: 'failed', resultSummary: 'ENGINE_CONNECTION_FAILED: Remote endpoint unreachable.' })
        .where(eq(securityScans.id, scan.id));
    }

    revalidatePath('/dashboard/security');
    return { success: true, scanId: scan.id };
  } catch (err) {
    console.error('Security Action Error:', err);
    return { error: 'Internal System Error' };
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
        .set({ status: 'failed', resultSummary: 'Sequence terminated by operator.' })
        .where(eq(securityScans.id, scanId));
      revalidatePath('/dashboard/security');
      return { success: true };
    }
  } catch (err) {}
  return { error: 'Failed to stop' };
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
    const response = await fetch(`${ENGINE_API_URL}/health`, { 
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    if (!response.ok) throw new Error();
    
    const latency = Date.now() - start;
    return { online: true, latency: `${latency}ms` };
  } catch (e) {
    return { online: false, latency: 'N/A' };
  }
}
