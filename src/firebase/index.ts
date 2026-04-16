'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

interface FirebaseInstance {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

/**
 * Безопасная инициализация Firebase.
 * Возвращает null для сервисов, если конфигурация пуста, не вызывая ошибок SDK.
 */
export function initializeFirebase(): FirebaseInstance {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, firestore: null, auth: null };
  }

  // Проверка валидности строк конфигурации
  const isValidStr = (s: any) => typeof s === 'string' && s.trim().length > 5;
  
  const isConfigValid = 
    firebaseConfig && 
    isValidStr(firebaseConfig.apiKey) && 
    isValidStr(firebaseConfig.projectId);

  if (!isConfigValid) {
    console.warn('Firebase: Конфигурация не найдена. Подключите проект через Studio.');
    return { firebaseApp: null, firestore: null, auth: null };
  }

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
    
    return { 
      firebaseApp: app, 
      firestore: db, 
      auth 
    };
  } catch (error) {
    console.error('Firebase: Ошибка инициализации:', error);
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
