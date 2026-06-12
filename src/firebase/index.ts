'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Направленные экспорты хуков из провайдера, чтобы избежать круговых зависимостей
export { useAuth, useFirestore, useUser, useFirebase, useMemoFirebase } from './provider';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

/**
 * BIO-HUB FIREBASE CORE - Safe Singleton
 * Предотвращает ошибки повторной инициализации при HMR в Next.js 16.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') return { firebaseApp: null, auth: null, firestore: null };

  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    auth = getAuth(app);
    
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
      });
    } catch (e) {
      db = getFirestore(app);
    }

    return { firebaseApp: app, auth, firestore: db };
  } catch (err) {
    console.error("Firebase Core Init Error:", err);
    return { firebaseApp: null, auth: null, firestore: null };
  }
}