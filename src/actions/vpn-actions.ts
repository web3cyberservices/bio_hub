
'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { createMarzbanUser, getMarzbanUser } from '@/lib/marzban';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-key-64-chars-long-for-production-security-min');

export async function vpnLogin(formData: FormData) {
  const username = (formData.get('username') as string || '').toLowerCase().trim();
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Введите имя пользователя и пароль' };
  }

  try {
    // Поиск пользователя в SQLite
    const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) {
      return { error: 'Пользователь не найден' };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { error: 'Неверный пароль' };
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
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400,
      path: '/'
    });

    return { success: true, role: user.role };
  } catch (error: any) {
    console.error('Login Error:', error);
    return { error: 'Ошибка сервера: ' + error.message };
  }
}

export async function vpnRegister(formData: FormData) {
  const username = (formData.get('username') as string || '').toLowerCase().trim();
  const password = formData.get('password') as string;

  if (!username || password.length < 4) {
    return { error: 'Имя пользователя обязательно, пароль минимум 4 символа' };
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const stmt = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
    stmt.run(username, hashedPassword, 'user');

    // Опциональная интеграция
    try {
      await createMarzbanUser(username);
    } catch (e) {}

    return { success: true };
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return { error: 'Это имя пользователя уже занято' };
    }
    console.error('Register Error:', error);
    return { error: 'Ошибка регистрации: ' + error.message };
  }
}

export async function getVpnMe() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('vpn_token')?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    let marzbanData = null;
    try {
      marzbanData = await getMarzbanUser(payload.username as string);
    } catch (e) {}
    
    return {
      username: payload.username,
      role: payload.role,
      vpn: marzbanData || { status: 'active', expire: null, links: ['vless://test-link-secure-reality-node'] }
    };
  } catch (e) {
    return null;
  }
}

export async function vpnLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('vpn_token');
}
