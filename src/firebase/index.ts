'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Инициализирует сервисы Firebase.
 * Возвращает null для сервисов, если конфигурация не валидна (пустые строки).
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, firestore: null, auth: null };
  }

  // Проверяем, что ключи не пустые (Studio должна их заполнить)
  const isConfigValid = 
    firebaseConfig && 
    firebaseConfig.apiKey && 
    firebaseConfig.apiKey.length > 0 &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId.length > 0;

  if (!isConfigValid) {
    console.warn('Firebase: Конфигурация не найдена. Подключите проект в Studio (кнопка "Connect to Firebase").');
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
