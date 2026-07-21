'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import db, { saveUserToDb } from '@/lib/db';
import { generateMarzbanUser } from '@/lib/marzban';
import { revalidatePath } from 'next/cache';

const SECRET_KEY_STR = process.env.JWT_SECRET || 'cyber-armor-vpn-secure-key-2026-v1';
const JWT_SECRET = new TextEncoder().encode(SECRET_KEY_STR);

export async function registerVpnUser(username: string) {
  try {
    // 50 GB Limit
    const dataLimit = 50 * 1024 * 1024 * 1024;
    
    const vpnProfile = await generateMarzbanUser({ 
      username, 
      dataLimit 
    });
    
    if (!vpnProfile.links || vpnProfile.links.length === 0) {
      throw new Error('Marzban API returned no links');
    }

    db.prepare('UPDATE users SET vpn_link = ? WHERE username = ?')
      .run(vpnProfile.links[0], username);
    
    return { success: true, link: vpnProfile.links[0] };
  } catch (error: any) {
    console.error("[VPN-ACTION] Key Gen Failed:", error.message);
    return { success: false, error: `VPN Service Error: ${error.message}` };
  }
}

export async function regenerateVpnKey() {
  try {
    const me = await getVpnMe();
    if (!me) return { error: 'Нужна авторизация' };
    
    if (!me.isActive && me.role !== 'admin') {
      return { error: 'Подписка неактивна.' };
    }

    const result = await registerVpnUser(me.username);
    if (!result.success) return { error: result.error };

    revalidatePath('/dashboard');
    return { success: true, link: result.link };
  } catch (e: any) {
    console.error("[VPN] Regeneration error:", e.message);
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
    if (error.message.includes('UNIQUE')) return { error: 'Пользователь уже существует' };
    return { error: 'Ошибка регистрации' };
  }
}

export async function getVpnMe() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('vpn_token')?.value;
    if (!token) return null;

    const { payload }: any = await jwtVerify(token, JWT_SECRET);
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
    
    db.prepare('UPDATE users SET expires_at = ? WHERE username = ?')
      .run(newExpire.toISOString(), me.username);

    // Generate/Sync Key with Marzban
    const vpnResult = await registerVpnUser(me.username);
    
    revalidatePath('/dashboard');
    return vpnResult.success ? { success: true } : { error: vpnResult.error };
  } catch (e: any) {
    console.error("[SHOP] Buy error:", e.message);
    return { error: 'Ошибка при оплате' };
  }
}

export async function getAllVpnUsers() {
  try {
    const me = await getVpnMe();
    if (!me || me.role !== 'admin') return [];

    const users = db.prepare("SELECT * FROM users WHERE role != 'admin'").all();
    
    return users.map((u: any) => {
      const exp = u.expires_at ? new Date(u.expires_at) : null;
      const active = exp && exp > new Date();
      return {
        id: u.id,
        username: u.username,
        hasKey: !!u.vpn_link,
        status: active ? 'online' : 'expired',
        protocol: 'VLESS+REALITY',
        expireDate: exp ? exp.toLocaleDateString('ru-RU') : 'Нет подписки',
        traffic: u.vpn_link ? '12 GB / 50 GB' : '0 GB',
        usagePercent: u.vpn_link ? 24 : 0
      };
    });
  } catch (e: any) {
    return [];
  }
}

export async function vpnLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('vpn_token');
}