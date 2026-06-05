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
 * Безопасная инициализация Firebase для Next.js 15.
 * Предотвращает ошибки повторной инициализации при HMR.
 */
export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    try {
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApp();
      }

      auth = getAuth(app);
      
      // БЕЗОПАСНАЯ ИНИЦИАЛИЗАЦИЯ FIRESTORE С TRY/CATCH
      try {
        // Сначала пытаемся инициализировать с кэшем
        firestore = initializeFirestore(app, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager()
          })
        });
      } catch (e: any) {
        // Если база уже инициализирована (ошибка code: 'failed-precondition' или сообщение 'already been called')
        // Просто возвращаем существующий экземпляр
        firestore = getFirestore(app);
      }

      return {
        firebaseApp: app,
        auth,
        firestore
      };
    } catch (error) {
      console.error("Firebase Core Initialization Failed:", error);
    }
  }

  return {
    firebaseApp: null,
    auth: null,
    firestore: null
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
