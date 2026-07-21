
'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'premium-vpn-secret-key-must-be-very-long-and-secure-123456');

export async function vpnLogin(formData: FormData) {
  const username = (formData.get('username') as string || '').toLowerCase().trim();
  const password = formData.get('password') as string;

  console.log(`[AUTH] Попытка входа: ${username}`);

  if (!username || !password) {
    return { error: 'Введите логин и пароль' };
  }

  try {
    const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) {
      console.log(`[AUTH] Пользователь не найден: ${username}`);
      return { error: 'Неверный логин или пароль' };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.log(`[AUTH] Неверный пароль: ${username}`);
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
    cookieStore.set('vpn_token', token, {
      httpOnly: true,
      secure: false, // Для работы по IP без SSL
      sameSite: 'lax',
      maxAge: 86400,
      path: '/'
    });

    return { success: true, role: user.role };
  } catch (error: any) {
    console.error('[AUTH] Ошибка входа:', error);
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
    const user: any = db.prepare('SELECT role, username FROM users WHERE username = ?').get(payload.username);
    
    return {
      username: payload.username,
      role: user?.role || payload.role,
      vpn: { 
        status: 'active', 
        expire: null, 
        links: [`vless://${payload.username}@premium.vpn.pro:443?security=reality&sni=google.com&fp=chrome&type=grpc&serviceName=grpc#VPN_PRO_${payload.username}`] 
      }
    };
  } catch (e) {
    return null;
  }
}

export async function getAllVpnUsers() {
  try {
    const me = await getVpnMe();
    if (me?.role !== 'admin') return { error: 'Доступ запрещен' };

    const users = db.prepare('SELECT id, username, role, created_at FROM users').all();
    
    // Имитируем данные о подключениях (в реальности брать из API Marzban)
    return users.map((u: any) => ({
      ...u,
      status: Math.random() > 0.3 ? 'online' : 'offline',
      protocol: 'VLESS + Reality',
      expire: 'Бессрочно',
      traffic: (Math.random() * 50).toFixed(1) + ' GB'
    }));
  } catch (e) {
    return { error: 'Ошибка получения списка' };
  }
}

export async function vpnLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('vpn_token');
}
