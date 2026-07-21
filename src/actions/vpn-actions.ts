'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { getSafeDb } from '@/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { createMarzbanUser, getMarzbanUser } from '@/lib/marzban';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-min-32-chars-for-dev-only');

export async function vpnLogin(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  try {
    // Режим прототипа для мгновенного теста без БД
    if ((username === 'admin' && password === 'admin') || (username === 'user' && password === 'user')) {
      const role = username === 'admin' ? 'admin' : 'user';
      const token = await new SignJWT({ 
        uid: 'proto-' + username, 
        role,
        username 
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

      return { success: true, role };
    }

    const db = getSafeDb();
    if (!db) return { error: 'Конфигурация базы данных не найдена. Создайте .env файл на сервере.' };

    const q = query(collection(db, 'vpn_users'), where('username', '==', username));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return { error: 'Пользователь не найден' };

    const userData = snapshot.docs[0].data();
    const isValid = await bcrypt.compare(password, userData.password);

    if (!isValid) return { error: 'Неверный пароль' };

    const token = await new SignJWT({ 
      uid: snapshot.docs[0].id, 
      role: userData.role,
      username: userData.username 
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

    return { success: true, role: userData.role };
  } catch (error: any) {
    console.error('Login Error:', error);
    return { error: 'Ошибка входа: ' + (error.message || 'неизвестная ошибка') };
  }
}

export async function vpnRegister(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  
  try {
    const db = getSafeDb();
    if (!db) return { error: 'База данных не подключена. Добавьте ключи Firebase в .env на сервере.' };

    const q = query(collection(db, 'vpn_users'), where('username', '==', username));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return { error: 'Это имя пользователя уже занято' };

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await addDoc(collection(db, 'vpn_users'), {
      username,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date().toISOString()
    });

    // Интеграция с Marzban (если установлена на сервере)
    try {
      await createMarzbanUser(username);
    } catch (e) {
      console.warn('Marzban не отвечает, пользователь создан только в БД');
    }

    return { success: true };
  } catch (error: any) {
    console.error('Register Error:', error);
    return { error: 'Ошибка регистрации: проверьте настройки Firestore или .env' };
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
    } catch (e) {
      // Игнорируем для прототипа
    }
    
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