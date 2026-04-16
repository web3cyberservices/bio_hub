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
 * Возвращает null для сервисов, если конфигурация еще не заполнена в Studio.
 * Это предотвращает ошибку trimEnd и другие сбои при пустых ключах.
 */
export function initializeFirebase(): FirebaseInstance {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, firestore: null, auth: null };
  }

  // Проверка валидности конфигурации
  const hasKey = (key: string | undefined) => typeof key === 'string' && key.length > 10;
  
  const isConfigValid = 
    firebaseConfig && 
    hasKey(firebaseConfig.apiKey) && 
    hasKey(firebaseConfig.projectId);

  if (!isConfigValid) {
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
