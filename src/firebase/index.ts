'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

export function initializeFirebase() {
  let firebaseApp: FirebaseApp;
  let firestore: Firestore;
  let auth: Auth;

  // Проверка на валидность API ключа перед инициализацией
  const isValidConfig = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined';

  if (!isValidConfig) {
    console.warn('Firebase API Key is missing. Please connect your project in Firebase Studio.');
    // Возвращаем пустые объекты, чтобы предотвратить крэш приложения на этапе инициализации
    return { firebaseApp: null as any, firestore: null as any, auth: null as any };
  }

  try {
    firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    firestore = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return { firebaseApp: null as any, firestore: null as any, auth: null as any };
  }

  return { firebaseApp, firestore, auth };
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './error-emitter';
export * from './errors';