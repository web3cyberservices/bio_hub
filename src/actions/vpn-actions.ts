'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

const SECRET_KEY_STR = process.env.JWT_SECRET || 'lume-vpn-super-secure-permanent-secret-key-2026-stable-version';
const JWT_SECRET = new TextEncoder().encode(SECRET_KEY_STR);

export async function vpnLogin(formData: FormData) {
  const username = (formData.get('username') as string || '').toLowerCase().trim();
  const password = formData.get('password') as string;

  try {
    const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) return { error: 'Неверный логин или пароль' };

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return { error: 'Неверный логин или пароль' };

    const token = await new SignJWT({ 
      uid: user.id.toString(), 
      role: user.role,
      username: user.username 
    })
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
      priority: 'high'
    });

    console.log(`[AUTH] Вход: ${username} (${user.role})`);
    return { success: true, role: user.role };
  } catch (error: any) {
    console.error('[AUTH] Ошибка входа:', error);
    return { error: 'Ошибка сервера' };
  }
}

export async function vpnRegister(formData: FormData) {
  const username = (formData.get('username') as string || '').toLowerCase().trim();
  const password = formData.get('password') as string;

  if (!username || password.length < 4) return { error: 'Логин обязателен, пароль от 4 символов' };
  if (username === 'admin') return { error: 'Имя зарезервировано' };
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
    stmt.run(username, hashedPassword, 'user');
    return { success: true };
  } catch (error: any) {
    if (error.message.includes('UNIQUE')) return { error: 'Пользователь существует' };
    return { error: 'Ошибка регистрации' };
  }
}

export async function getVpnMe() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('vpn_token')?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user: any = db.prepare('SELECT role, username, expires_at, created_at, last_purchase_at FROM users WHERE username = ?').get(payload.username);
    
    if (!user) return null;

    const now = new Date();
    const expiresAt = user.expires_at ? new Date(user.expires_at) : null;
    const isActive = user.role === 'admin' || (expiresAt && expiresAt > now);

    return {
      username: user.username,
      role: user.role,
      expiresAt: user.expires_at,
      createdAt: user.created_at,
      lastPurchaseAt: user.last_purchase_at,
      isActive: !!isActive,
      vpn: { 
        status: isActive ? 'active' : 'expired', 
        links: isActive ? [`vless://${user.username}@premium.lumevpn.pro:443?security=reality&sni=google.com&fp=chrome&type=grpc&serviceName=grpc#LumeVPN_${user.username}`] : [] 
      }
    };
  } catch (e) {
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

    db.prepare('UPDATE users SET expires_at = ?, last_purchase_at = ? WHERE username = ?').run(dbDate, nowDb, me.username);
    
    console.log(`[SHOP] Пользователь ${me.username} купил ${months} мес. До: ${dbDate}`);
    revalidatePath('/dashboard');
    return { success: true, expiresAt: dbDate };
  } catch (e) {
    return { error: 'Ошибка при покупке' };
  }
}

export async function getAllVpnUsers() {
  try {
    const me = await getVpnMe();
    if (me?.role !== 'admin') return { error: 'Доступ запрещен' };

    const users = db.prepare('SELECT id, username, role, expires_at, created_at, last_purchase_at FROM users WHERE username != "admin" ORDER BY created_at DESC').all();
    
    return users.map((u: any) => {
      const expiresAtDate = u.expires_at ? new Date(u.expires_at) : null;
      const createdAtDate = u.created_at ? new Date(u.created_at) : null;
      const lastPurchaseAtDate = u.last_purchase_at ? new Date(u.last_purchase_at) : null;
      const isActive = (expiresAtDate && expiresAtDate > new Date());
      
      const trafficUsed = ((u.id * 13.7) % 95 + 5).toFixed(1);
      const trafficLimit = "100.0 GB";

      return {
        ...u,
        status: isActive ? 'online' : 'expired',
        protocol: 'VLESS + Reality',
        expireDate: expiresAtDate ? expiresAtDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Нет подписки',
        createdDate: createdAtDate ? createdAtDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : '---',
        lastPurchaseDate: lastPurchaseAtDate ? lastPurchaseAtDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : null,
        rawExpire: u.expires_at,
        traffic: `${trafficUsed} GB / ${trafficLimit}`,
        usagePercent: Math.round((parseFloat(trafficUsed) / 100) * 100),
        hasKey: isActive
      };
    });
  } catch (e) {
    console.error('[ADMIN] Ошибка списка пользователей:', e);
    return [];
  }
}

export async function vpnLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('vpn_token');
}