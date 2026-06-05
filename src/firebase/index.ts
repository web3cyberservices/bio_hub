'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  Firestore
} from 'firebase/firestore';

/**
 * Архитектура Safe Firebase Singleton.
 * Поддерживает Next.js Fast Refresh и предотвращает ошибки повторной инициализации.
 */

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, auth: null, firestore: null };
  }

  // 1. Инициализация App
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  
  // 2. Инициализация Auth
  auth = getAuth(app);
  
  // 3. Безопасная инициализация Firestore
  try {
    firestore = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  } catch (error: any) {
    // Если Firestore уже инициализирован (HMR), получаем текущий инстанс
    if (error.message?.includes('already been called') || error.code === 'failed-precondition') {
      firestore = getFirestore(app);
    } else {
      console.error("Critical Firestore Init Error:", error);
      firestore = getFirestore(app);
    }
  }

  return { firebaseApp: app, auth, firestore };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';