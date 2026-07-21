
'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { createMarzbanUser, getMarzbanUser } from '@/lib/marzban';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'premium-vpn-secret-key-must-be-very-long-and-secure-123456');

export async function vpnLogin(formData: FormData) {
  const username = (formData.get('username') as string || '').toLowerCase().trim();
  const password = formData.get('password') as string;

  console.log(`[AUTH] Попытка входа: ${username}`);

  if (!username || !password) {
    return { error: 'Введите логин и пароль' };
  }

  try {
    // Проверяем наличие таблицы и пользователя
    const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) {
      console.log(`[AUTH] Пользователь не найден в БД: ${username}`);
      return { error: 'Пользователь не найден' };
    }

    console.log(`[AUTH] Пользователь найден, проверяем пароль...`);

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.log(`[AUTH] Неверный пароль для пользователя: ${username}`);
      return { error: 'Неверный пароль' };
    }

    console.log(`[AUTH] Пароль верный. Генерируем токен...`);

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
    // ВАЖНО: secure: false для работы по HTTP (без SSL) на IP-адресе
    cookieStore.set('vpn_token', token, {
      httpOnly: true,
      secure: false, // Отключаем принудительный HTTPS для тестов на IP
      sameSite: 'lax',
      maxAge: 86400,
      path: '/'
    });

    console.log(`[AUTH] Вход выполнен успешно: ${username}`);
    return { success: true, role: user.role };
  } catch (error: any) {
    console.error('[AUTH] Критическая ошибка при входе:', error);
    return { error: 'Ошибка сервера. Проверьте логи PM2.' };
  }
}

export async function vpnRegister(formData: FormData) {
  const username = (formData.get('username') as string || '').toLowerCase().trim();
  const password = formData.get('password') as string;

  if (!username || password.length < 4) {
    return { error: 'Логин обязателен, пароль минимум 4 символа' };
  }
  
  try {
    console.log(`[AUTH] Регистрация нового пользователя: ${username}`);
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
    stmt.run(username, hashedPassword, 'user');

    return { success: true };
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return { error: 'Это имя пользователя уже занято' };
    }
    console.error('[AUTH] Ошибка регистрации:', error);
    return { error: 'Ошибка при создании аккаунта' };
  }
}

export async function getVpnMe() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('vpn_token')?.value;
    if (!token) {
      console.log('[AUTH] Токен не найден в куках');
      return null;
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Получаем актуальные данные из БД
    const user: any = db.prepare('SELECT role, username FROM users WHERE username = ?').get(payload.username);
    
    return {
      username: payload.username,
      role: user?.role || payload.role,
      vpn: { status: 'active', expire: null, links: ['vless://premium-access-link-placeholder'] }
    };
  } catch (e) {
    console.error('[AUTH] Ошибка проверки токена:', e);
    return null;
  }
}

export async function vpnLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('vpn_token');
}
