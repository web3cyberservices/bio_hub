'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Инициализирует сервисы Firebase с защитой от пустой конфигурации.
 * Предотвращает ошибку "trimEnd" при отсутствии API-ключа.
 */
export function initializeFirebase() {
  let firebaseApp: FirebaseApp | null = null;
  let firestore: Firestore | null = null;
  let auth: Auth | null = null;

  // Проверяем наличие валидного конфига. 
  // API ключ должен быть строкой и иметь длину (обычно > 20 символов).
  const hasValidConfig = 
    firebaseConfig && 
    typeof firebaseConfig.apiKey === 'string' &&
    firebaseConfig.apiKey.length > 5;

  if (!hasValidConfig) {
    console.warn('Firebase: Конфигурация отсутствует. Подключите проект в Studio.');
    return { firebaseApp: null, firestore: null, auth: null };
  }

  try {
    firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    firestore = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
  } catch (error) {
    console.error('Firebase: Ошибка при инициализации сервисов:', error);
  }

  return { 
    firebaseApp, 
    firestore, 
    auth 
  };
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './error-emitter';
export * from './errors';
