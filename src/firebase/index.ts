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

/**
 * Безопасная инициализация Firebase Singleton.
 * Поддерживает Next.js Fast Refresh и устраняет ошибку "already been called".
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') return { firebaseApp: null, auth: null, firestore: null };

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(app);
  
  const firestore = (() => {
    try {
      // Инициализируем Firestore с поддержкой мульти-таб кэширования
      return initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    } catch (error: any) {
      // Если Firestore уже запущен (Fast Refresh), возвращаем текущий инстанс
      if (error.message?.includes('already been called') || error.code === 'failed-precondition') {
        return getFirestore(app);
      }
      throw error;
    }
  })();

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
