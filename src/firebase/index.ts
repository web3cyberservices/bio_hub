'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

/**
 * БЕЗОПАСНАЯ ИНИЦИАЛИЗАЦИЯ (Safe Singleton Pattern)
 * Предотвращает ошибку "initializeFirestore() has already been called"
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') return { firebaseApp: null, auth: null, firestore: null };

  try {
    // 1. Инициализация App
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    // 2. Инициализация Auth
    auth = getAuth(app);
    
    // 3. Безопасная инициализация Firestore
    try {
      // Сначала пробуем получить существующий инстанс
      firestore = getFirestore(app);
    } catch (e) {
      // Если инстанса нет, инициализируем с настройками
      firestore = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    }

    return { firebaseApp: app, auth, firestore };
  } catch (error) {
    console.error("Firebase Core Initialization Failed:", error);
    return { firebaseApp: null, auth: null, firestore: null };
  }
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
