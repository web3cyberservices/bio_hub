'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import db, { saveUserToDb } from '@/lib/db';
import { generateMarzbanUser } from '@/lib/marzban';
import { revalidatePath } from 'next/cache';

const SECRET_KEY_STR = 'cyber-armor-vpn-secure-key-2026-v1';
const JWT_SECRET = new TextEncoder().encode(SECRET_KEY_STR);

export async function registerVpnUser(firebaseUid: string, username: string) {
  try {
    const vpnProfile = await generateMarzbanUser({ 
      username, 
      dataLimit: 50 * 1024 * 1024 * 1024 
    });
    
    saveUserToDb({ 
      uid: firebaseUid, 
      username: username, 
      vpn_link: vpnProfile.links[0] 
    });
    
    return { success: true, link: vpnProfile.links[0] };
  } catch (error: any) {
    console.error("[CYBER-ARMOR] VPN Gen Failed:", error.message);
    return { success: false, error: "VPN Service Error" };
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
      secure: false, 
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return { success: true, role: user.role };
  } catch (error: any) {
    console.error("[AUTH] Login error:", error.message);
    return { error: 'Ошибка сервера' };
  }
}

export async function vpnRegister(formData: FormData) {
  const username = (formData.get('username') as string || '').toLowerCase().trim();
  const password = formData.get('password') as string;

  if (!username || password.length < 4) return { error: 'Логин обязателен, пароль от 4 символов' };
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(username, hashedPassword, 'user');
    return { success: true };
  } catch (error: any) {
    if (error.message.includes('UNIQUE')) return { error: 'Пользователь существует' };
    return { error: 'Ошибка регистрации' };
  }
}

export async function getVpnMe() {
  const cookieStore = await cookies();
  const token = cookieStore.get('vpn_token')?.value;
  if (!token) return null;

  try {
    const { payload }: any = await jwtVerify(token, JWT_SECRET);
    const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(payload.username);
    
    if (!user) return null;

    const now = new Date();
    const expiresAt = user.expires_at ? new Date(user.expires_at) : null;
    const isActive = user.role === 'admin' || (expiresAt && expiresAt > now);

    return {
      username: user.username,
      role: user.role,
      expiresAt: user.expires_at,
      isActive: !!isActive,
      lastPurchaseAt: user.last_purchase_at,
      vpn: { 
        status: isActive ? 'active' : 'expired', 
        links: user.vpn_link ? [user.vpn_link] : [] 
      }
    };
  } catch (e) {
    console.error("[AUTH] Session invalid, clearing cookie:", e);
    cookieStore.delete('vpn_token');
    return null;
  }
}

export async function buySubscription(months: number) {
  try {
    const me = await getVpnMe();
    if (!me) return { error: 'Нужна авторизация' };

    const now = new Date();
    let newExpire = new Date();
    if (me.expiresAt && new Date(me.expiresAt) > now) {
      newExpire = new Date(me.expiresAt);
    }
    newExpire.setMonth(newExpire.getMonth() + months);
    
    const dbDate = newExpire.toISOString();
    const nowDb = now.toISOString();

    db.prepare('UPDATE users SET expires_at = ?, last_purchase_at = ? WHERE username = ?')
      .run(dbDate, nowDb, me.username);

    if (!me.vpn.links[0]) {
      const firebaseUid = `local_${me.username}_${Date.now()}`;
      await registerVpnUser(firebaseUid, me.username);
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (e: any) {
    console.error("[SHOP] Buy error:", e.message);
    return { error: 'Ошибка при покупке' };
  }
}

export async function getAllVpnUsers() {
  try {
    const me = await getVpnMe();
    if (!me || me.role !== 'admin') return [];

    const users = db.prepare('SELECT * FROM users WHERE role != ? ORDER BY created_at DESC').all('admin');
    
    return users.map((u: any) => {
      const expiresAtDate = u.expires_at ? new Date(u.expires_at) : null;
      const isActive = (expiresAtDate && expiresAtDate > new Date());
      return {
        id: u.id,
        username: u.username,
        hasKey: !!u.vpn_link,
        status: isActive ? 'online' : 'expired',
        protocol: 'VLESS + Reality',
        expireDate: expiresAtDate ? expiresAtDate.toLocaleDateString('ru-RU') : 'Нет подписки',
        createdDate: u.created_at ? new Date(u.created_at).toLocaleDateString('ru-RU') : 'N/A',
        lastPurchaseDate: u.last_purchase_at ? new Date(u.last_purchase_at).toLocaleString('ru-RU') : null,
        traffic: u.vpn_link ? '12 GB / 50 GB' : '0 GB / 0 GB',
        usagePercent: u.vpn_link ? 24 : 0
      };
    });
  } catch (e: any) {
    console.error("[ADMIN] Client list error:", e.message);
    return [];
  }
}

export async function vpnLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('vpn_token');
}
