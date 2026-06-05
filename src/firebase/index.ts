
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
 * BIO-HUB FIREBASE CORE (v16.2 Optimized)
 * Использование паттерна Safe Singleton для предотвращения ошибок HMR.
 */

let app: FirebaseApp;
let authInstance: Auth;
let dbInstance: Firestore;

export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, auth: null, firestore: null };
  }

  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  if (!authInstance) {
    authInstance = getAuth(app);
  }
  
  if (!dbInstance) {
    try {
      dbInstance = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    } catch (error: any) {
      // Игнорируем ошибку "already initialized", если она возникла при HMR
      dbInstance = getFirestore(app);
    }
  }

  return { firebaseApp: app, auth: authInstance, firestore: dbInstance };
}

// Ленивые функции доступа
export const getSafeAuth = () => {
  const { auth } = initializeFirebase();
  return auth as Auth;
};

export const getSafeDb = () => {
  const { firestore } = initializeFirebase();
  return firestore as Firestore;
};

// Экспортируем основные утилиты напрямую для лучшей работы Turbopack
export { useFirebase, useAuth, useFirestore, useUser, useMemoFirebase } from './provider';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { errorEmitter } from './error-emitter';
export { FirestorePermissionError } from './errors';
