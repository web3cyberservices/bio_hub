
'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { createMarzbanUser, getMarzbanUser } from '@/lib/marzban';

// Секрет для JWT. В продакшене ОБЯЗАТЕЛЬНО задавать в .env
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'premium-vpn-secret-key-must-be-very-long-and-secure-123456');

export async function vpnLogin(formData: FormData) {
  const username = (formData.get('username') as string || '').toLowerCase().trim();
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Введите логин и пароль' };
  }

  try {
    console.log(`Попытка входа для пользователя: ${username}`);
    
    // Поиск пользователя в базе
    const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) {
      console.log(`Пользователь ${username} не найден в БД`);
      return { error: 'Пользователь не найден' };
    }

    // Проверка пароля
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.log(`Неверный пароль для ${username}`);
      return { error: 'Неверный пароль' };
    }

    // Создание токена
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

    console.log(`Успешный вход: ${username}`);
    return { success: true, role: user.role };
  } catch (error: any) {
    console.error('Критическая ошибка при входе:', error);
    return { error: 'Ошибка сервера. Проверьте логи.' };
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

    console.log(`Зарегистрирован новый пользователь: ${username}`);

    // Попытка создать пользователя в Marzban (если настроен)
    try {
      await createMarzbanUser(username);
    } catch (e) {
      console.warn(`Marzban не ответил для ${username}, но в БД пользователь создан.`);
    }

    return { success: true };
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return { error: 'Это имя пользователя уже занято' };
    }
    console.error('Ошибка регистрации:', error);
    return { error: 'Ошибка при создании аккаунта' };
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
      vpn: marzbanData || { status: 'active', expire: null, links: ['vless://premium-access-link-placeholder'] }
    };
  } catch (e) {
    return null;
  }
}

export async function vpnLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('vpn_token');
}
