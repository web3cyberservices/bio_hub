'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { getSafeDb } from '@/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { createMarzbanUser, getMarzbanUser } from '@/lib/marzban';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-min-32-chars-long-enough');

export async function vpnLogin(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  try {
    const db = getSafeDb();

    // Автоматическое создание тестовых аккаунтов для прототипа
    if ((username === 'admin' && password === 'admin') || (username === 'user' && password === 'user')) {
      const qTest = query(collection(db, 'vpn_users'), where('username', '==', username));
      const snapTest = await getDocs(qTest);
      if (snapTest.empty) {
        const hashedPassword = await bcrypt.hash(username, 10);
        await addDoc(collection(db, 'vpn_users'), {
          username,
          password: hashedPassword,
          role: username === 'admin' ? 'admin' : 'user',
          createdAt: new Date().toISOString()
        });
        console.log(`Создан тестовый аккаунт: ${username}`);
      }
    }

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
  } catch (error) {
    console.error('Login Error:', error);
    return { error: 'Ошибка сервера при входе' };
  }
}

export async function vpnRegister(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  
  try {
    const db = getSafeDb();

    const q = query(collection(db, 'vpn_users'), where('username', '==', username));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return { error: 'Это имя пользователя уже занято' };

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Создание пользователя в Marzban (если API доступно)
    try {
      await createMarzbanUser(username);
    } catch (e) {
      console.warn('Marzban integration skipped or failed:', e);
    }

    await addDoc(collection(db, 'vpn_users'), {
      username,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('Register Error:', error);
    return { error: 'Не удалось завершить регистрацию' };
  }
}

export async function getVpnMe() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('vpn_token')?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Пытаемся получить данные из Marzban, если нет - возвращаем базовые данные
    let marzbanData = null;
    try {
      marzbanData = await getMarzbanUser(payload.username as string);
    } catch (e) {
      console.warn('Marzban data fetch failed:', e);
    }
    
    return {
      username: payload.username,
      role: payload.role,
      vpn: marzbanData || { status: 'active', expire: null, links: ['vless://test-link-placeholder'] }
    };
  } catch (e) {
    return null;
  }
}

export async function vpnLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('vpn_token');
}
