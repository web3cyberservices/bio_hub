import { NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '@/lib/db';
import { registerVpnUser } from '@/actions/vpn-actions';

/**
 * Обработка уведомлений об оплате от Lava.top
 */
export async function POST(req: Request) {
  try {
    // 1. Быстрый фильтр O(1) (Защита от DDoS и мусора)
    const clientToken = req.headers.get('X-Lava-Token');
    const lavaSecret = process.env.LAVA_SECRET_KEY;
    const webhookToken = process.env.LAVA_WEBHOOK_TOKEN;

    if (!clientToken || clientToken !== webhookToken) {
      console.warn('[LAVA-WEBHOOK] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized Edge' }, { status: 401 });
    }

    // 2. Чтение тела и проверка подписи Lava
    const rawBody = await req.text();
    const signature = req.headers.get('Authorization') || req.headers.get('signature');
    
    if (!signature || !lavaSecret) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', lavaSecret)
      .update(rawBody)
      .digest('hex');

    // Безопасное сравнение подписей
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      console.error('[LAVA-WEBHOOK] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const data = JSON.parse(rawBody);
    
    // Проверяем статус платежа (зависит от API Lava, обычно 'success' или 'paid')
    if (data.status === 'success' || data.status === 'paid') {
      const { order_id, amount } = data;
      // В order_id мы передаем "username_months" (например, "user123_3")
      const [username, monthsStr] = order_id.split('_');
      const months = parseInt(monthsStr);

      if (username && months) {
        console.log(`[LAVA-WEBHOOK] Payment success for ${username}: ${months} months`);
        
        const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if (user) {
          let newExpire = new Date();
          if (user.expires_at && new Date(user.expires_at) > new Date()) {
            newExpire = new Date(user.expires_at);
          }
          newExpire.setMonth(newExpire.getMonth() + months);

          db.prepare('UPDATE users SET expires_at = ?, last_purchase_at = ? WHERE username = ?')
            .run(newExpire.toISOString(), new Date().toISOString(), username);

          // Обновляем ключ в Marzban (синхронизация лимитов)
          await registerVpnUser(username);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[LAVA-WEBHOOK-ERROR]', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
