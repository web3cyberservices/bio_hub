'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { generateMarzbanUser } from '@/lib/marzban';
import { revalidatePath } from 'next/cache';

const SECRET_KEY_STR = process.env.JWT_SECRET || 'cyber-armor-vpn-secure-key-2026-v1';
const JWT_SECRET = new TextEncoder().encode(SECRET_KEY_STR);

export async function registerVpnUser(username: string) {
  try {
    const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) return { success: false, error: 'Пользователь не найден' };

    const dataLimit = (user.limit_gb || 100) * 1024 * 1024 * 1024;
    
    const vpnProfile = await generateMarzbanUser({ 
      username, 
      dataLimit 
    });
    
    const links = vpnProfile.links || [];
    const link = links.length > 0 ? links[0] : null;

    if (!link) {
      return { 
        success: false, 
        error: 'Marzban не вернул ссылок. Проверьте конфигурацию.' 
      };
    }

    db.prepare('UPDATE users SET vpn_link = ? WHERE username = ?')
      .run(link, username);
    
    return { success: true, link };
  } catch (error: any) {
    console.error("[VPN-ACTION] Error:", error.message);
    return { success: false, error: error.message };
  }
}

export async function regenerateVpnKey() {
  try {
    const me = await getVpnMe();
    if (!me) return { error: 'Нужна авторизация' };
    
    const result = await registerVpnUser(me.username);
    if (!result.success) return { error: result.error };

    revalidatePath('/dashboard');
    return { success: true, link: result.link };
  } catch (e: any) {
    return { error: 'Ошибка при перегенерации ключа' };
  }
}

export async function vpnLogin(formData: FormData) {
  const username = (formData.get('username') as string || '').toLowerCase().trim();
  const password = formData.get('password') as string;

  try {
    const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) return { error: 'Неверный логин или пароль' };

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return { error: 'Неверный логин или пароль' };

    const token = await new SignJWT({ uid: user.id.toString(), role: user.role, username: user.username })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    const cookieStore = await cookies();
    cookieStore.set('vpn_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return { success: true, role: user.role };
  } catch (error: any) {
    return { error: 'Ошибка сервера' };
  }
}

export async function getVpnMe() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('vpn_token')?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(payload.username);
    if (!user) return null;

    const now = new Date();
    const expiresAt = user.expires_at ? new Date(user.expires_at) : null;
    const isAdmin = user.role === 'admin';
    const isActive = isAdmin || (expiresAt && expiresAt > now);

    return {
      username: user.username,
      role: user.role,
      expiresAt: user.expires_at,
      lastPurchaseAt: user.last_purchase_at,
      limitGb: user.limit_gb || 100,
      isActive: !!isActive,
      vpn: { 
        status: isActive ? 'active' : 'expired', 
        links: user.vpn_link ? [user.vpn_link] : [] 
      }
    };
  } catch (e: any) {
    return null;
  }
}

export async function getAllVpnUsers() {
  try {
    const me = await getVpnMe();
    if (!me || me.role !== 'admin') return [];

    const users = db.prepare("SELECT * FROM users WHERE role != 'admin' ORDER BY created_at DESC").all();
    
    return users.map((u: any) => {
      const exp = u.expires_at ? new Date(u.expires_at) : null;
      const active = exp && exp > new Date();
      return {
        id: u.id,
        username: u.username,
        hasKey: !!u.vpn_link,
        status: active ? 'online' : 'expired',
        protocol: 'VLESS+REALITY',
        limitGb: u.limit_gb || 100,
        expireDate: exp ? exp.toLocaleDateString('ru-RU') : 'Нет подписки',
        rawExpire: u.expires_at
      };
    });
  } catch (e: any) {
    return [];
  }
}

export async function updateUserByAdmin(username: string, months: number, limitGb: number) {
  try {
    const me = await getVpnMe();
    if (!me || me.role !== 'admin') return { error: 'Доступ запрещен' };

    const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) return { error: 'Пользователь не найден' };

    let newExpire = new Date();
    if (user.expires_at && new Date(user.expires_at) > new Date()) {
      newExpire = new Date(user.expires_at);
    }
    newExpire.setMonth(newExpire.getMonth() + months);

    db.prepare('UPDATE users SET expires_at = ?, limit_gb = ? WHERE username = ?')
      .run(newExpire.toISOString(), limitGb, username);

    await registerVpnUser(username);
    
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e: any) {
    return { error: 'Ошибка при обновлении' };
  }
}

export async function deleteUserByAdmin(username: string) {
  try {
    const me = await getVpnMe();
    if (!me || me.role !== 'admin') return { error: 'Доступ запрещен' };

    db.prepare('DELETE FROM users WHERE username = ?').run(username);
    
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e: any) {
    return { error: 'Ошибка при удалении' };
  }
}

export async function vpnLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('vpn_token');
}

/**
 * Инициация покупки (Перенаправление на Lava.top или тест)
 */
export async function buySubscription(months: number) {
  try {
    const me = await getVpnMe();
    if (!me) return { error: 'Нужна авторизация' };

    const LAVA_PRODUCT_URL = 'https://app.lava.top/products/52abb33c-7a6d-4667-80df-c22730b988c6';

    // В режиме разработки просто продлеваем подписку (для тестов)
    if (process.env.NODE_ENV !== 'production') {
      const now = new Date();
      let newExpire = new Date();
      if (me.expiresAt && new Date(me.expiresAt) > now) {
        newExpire = new Date(me.expiresAt);
      }
      newExpire.setMonth(newExpire.getMonth() + months);
      
      db.prepare('UPDATE users SET expires_at = ?, last_purchase_at = ? WHERE username = ?')
        .run(newExpire.toISOString(), now.toISOString(), me.username);

      await registerVpnUser(me.username);
      revalidatePath('/dashboard');
      return { success: true, message: 'Тестовая оплата прошла успешно (DEV)' };
    }

    // В продакшене возвращаем URL на товар в Lava.top
    return { success: true, url: LAVA_PRODUCT_URL };
  } catch (e: any) {
    return { error: 'Ошибка при создании заказа' };
  }
}
