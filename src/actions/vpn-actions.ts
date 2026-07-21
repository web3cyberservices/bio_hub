
'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { getSafeDb } from '@/firebase';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { createMarzbanUser, getMarzbanUser } from '@/lib/marzban';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-min-32-chars');

export async function vpnLogin(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  const db = getSafeDb();
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
}

export async function vpnRegister(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const db = getSafeDb();

  // Check if exists
  const q = query(collection(db, 'vpn_users'), where('username', '==', username));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) return { error: 'Имя пользователя занято' };

  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Register in Marzban
  const marzbanUser = await createMarzbanUser(username);
  if (!marzbanUser) return { error: 'Ошибка интеграции с VPN сервером' };

  await addDoc(collection(db, 'vpn_users'), {
    username,
    password: hashedPassword,
    role: 'user',
    createdAt: new Date().toISOString()
  });

  return { success: true };
}

export async function getVpnMe() {
  const cookieStore = await cookies();
  const token = cookieStore.get('vpn_token')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const marzbanData = await getMarzbanUser(payload.username as string);
    
    return {
      username: payload.username,
      role: payload.role,
      vpn: marzbanData
    };
  } catch {
    return null;
  }
}

export async function vpnLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('vpn_token');
}
