'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Безопасная инициализация Firebase.
 * Возвращает null для сервисов, если конфигурация еще не заполнена в Studio.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, firestore: null, auth: null };
  }

  // Проверка на наличие ключей. Studio должна заполнить их в config.ts.
  const isConfigValid = 
    firebaseConfig && 
    typeof firebaseConfig.apiKey === 'string' && 
    firebaseConfig.apiKey.trim().length > 0 &&
    typeof firebaseConfig.projectId === 'string' &&
    firebaseConfig.projectId.trim().length > 0;

  if (!isConfigValid) {
    console.warn('Firebase: Ожидание подключения проекта в Studio...');
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
