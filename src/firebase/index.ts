'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

export function initializeFirebase() {
  let firebaseApp: FirebaseApp | null = null;
  let firestore: Firestore | null = null;
  let auth: Auth | null = null;

  // Тщательная проверка конфигурации
  const isValidConfig = 
    firebaseConfig.apiKey && 
    firebaseConfig.apiKey.length > 10 && 
    firebaseConfig.apiKey !== "undefined";

  if (!isValidConfig) {
    console.warn('Firebase: Ожидание настройки конфигурации. Подключите проект в Studio.');
    return { firebaseApp: null, firestore: null, auth: null };
  }

  try {
    firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    firestore = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
  } catch (error) {
    console.error('Firebase: Ошибка инициализации сервисов:', error);
  }

  return { 
    firebaseApp: firebaseApp as FirebaseApp, 
    firestore: firestore as Firestore, 
    auth: auth as Auth 
  };
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './error-emitter';
export * from './errors';
