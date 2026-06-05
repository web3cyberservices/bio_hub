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

export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    try {
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApp();
      }

      auth = getAuth(app);
      
      // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Сначала пытаемся получить существующий экземпляр Firestore.
      // Если initializeFirestore уже был вызван (например, при HMR), повторный вызов с опциями вызовет ошибку.
      try {
        // Мы проверяем, существует ли уже инициализированный firestore для этого приложения
        firestore = getFirestore(app);
      } catch (e) {
        // Если не найден, инициализируем один раз с настройками кэша
        firestore = initializeFirestore(app, {
          cache: persistentLocalCache({
            tabManager: persistentMultipleTabManager()
          })
        });
      }

      return {
        firebaseApp: app,
        auth,
        firestore
      };
    } catch (error) {
      console.error("Firebase Initialization Failed:", error);
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
