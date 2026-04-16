'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Инициализирует сервисы Firebase с максимальной защитой.
 * Предотвращает ошибку trimEnd, возникающую при пустых ключах.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, firestore: null, auth: null };
  }

  // Строгая проверка валидности конфигурации
  const isConfigValid = 
    firebaseConfig && 
    typeof firebaseConfig.apiKey === 'string' && 
    firebaseConfig.apiKey.trim().length > 10; // API ключ обычно длиннее 10 символов

  if (!isConfigValid) {
    console.warn('Firebase: Проект не подключен или конфигурация пуста. Используйте Studio для подключения.');
    return { firebaseApp: null, firestore: null, auth: null };
  }

  try {
    const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(firebaseApp);
    const auth = getAuth(firebaseApp);
    
    return { 
      firebaseApp, 
      firestore, 
      auth 
    };
  } catch (error) {
    console.error('Firebase Initialization Error:', error);
    return { firebaseApp: null, firestore: null, auth: null };
  }
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './error-emitter';
export * from './errors';
