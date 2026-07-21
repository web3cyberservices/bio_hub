
'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'premium-vpn-secret-key-must-be-very-long-and-secure-123456');

export async function vpnLogin(formData: FormData) {
  const username = (formData.get('username') as string || '').toLowerCase().trim();
  const password = formData.get('password') as string;

  console.log(`[AUTH] Попытка входа: ${username}`);

  try {
    const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) {
      console.log(`[AUTH] Пользователь ${username} не найден`);
      return { error: 'Неверный логин или пароль' };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.log(`[AUTH] Неверный пароль для ${username}`);
      return { error: 'Неверный логин или пароль' };
    }

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
    // secure: false для работы по HTTP на IP-адресе сервера
    cookieStore.set('vpn_token', token, {
      httpOnly: true,
      secure: false, 
      sameSite: 'lax',
      maxAge: 86400,
      path: '/'
    });

    console.log(`[AUTH] Успешный вход: ${username} (${user.role})`);
    return { success: true, role: user.role };
  } catch (error: any) {
    console.error('[AUTH] Критическая ошибка входа:', error);
    return { error: 'Ошибка сервера' };
  }
}

export async function vpnRegister(formData: FormData) {
  const username = (formData.get('username') as string || '').toLowerCase().trim();
  const password = formData.get('password') as string;

  if (!username || password.length < 4) {
    return { error: 'Логин обязателен, пароль минимум 4 символа' };
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
    stmt.run(username, hashedPassword, 'user');
    return { success: true };
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return { error: 'Пользователь уже существует' };
    }
    return { error: 'Ошибка регистрации' };
  }
}

export async function getVpnMe() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('vpn_token')?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user: any = db.prepare('SELECT role, username, expires_at FROM users WHERE username = ?').get(payload.username);
    
    if (!user) return null;

    const now = new Date();
    const expiresAt = user.expires_at ? new Date(user.expires_at) : null;
    const isActive = expiresAt && expiresAt > now;

    return {
      username: user.username,
      role: user.role,
      expiresAt: user.expires_at,
      isActive: !!isActive,
      vpn: { 
        status: isActive ? 'active' : 'expired', 
        links: isActive ? [`vless://${user.username}@premium.vpn.pro:443?security=reality&sni=google.com&fp=chrome&type=grpc&serviceName=grpc#VPN_PRO_${user.username}`] : [] 
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
    
    const dbDate = newExpire.toISOString().slice(0, 19).replace('T', ' ');
    db.prepare('UPDATE users SET expires_at = ? WHERE username = ?').run(dbDate, me.username);
    
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

    const users = db.prepare('SELECT id, username, role, expires_at, created_at FROM users WHERE role != "admin"').all();
    
    return users.map((u: any) => {
      const expiresAtDate = u.expires_at ? new Date(u.expires_at) : null;
      const isActive = expiresAtDate && expiresAtDate > new Date();
      
      // Имитация трафика для демо
      const trafficUsed = (Math.random() * 80).toFixed(1);
      const trafficLimit = "100.0 GB";

      return {
        ...u,
        status: isActive ? 'online' : 'expired',
        protocol: 'VLESS + Reality',
        expireDate: expiresAtDate ? expiresAtDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Нет подписки',
        rawExpire: u.expires_at,
        traffic: `${trafficUsed} GB / ${trafficLimit}`,
        usagePercent: Math.round((parseFloat(trafficUsed) / 100) * 100)
      };
    });
  } catch (e) {
    console.error('[ADMIN] Ошибка получения пользователей:', e);
    return { error: 'Ошибка получения списка' };
  }
}

export async function vpnLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('vpn_token');
}
