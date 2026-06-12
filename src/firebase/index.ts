'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { firebaseConfig } from './config';

/**
 * BIO-HUB FIREBASE CORE - Safe Singleton
 * Предотвращает ошибки повторной инициализации при HMR и SSR.
 */

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

export function initializeFirebase() {
  if (typeof window === 'undefined') return { firebaseApp: null, auth: null, firestore: null };

  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    if (!auth) auth = getAuth(app);
    
    if (!db) {
      try {
        db = initializeFirestore(app, {
          localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
        });
      } catch (e) {
        // Fallback если инициализация уже произошла
        db = getFirestore(app);
      }
    }
  } catch (err) {
    console.error("Firebase Core Init Error:", err);
  }

  return { firebaseApp: app, auth, firestore: db };
}

// Прямые экспорты хуков из провайдера, БЕЗ экспорта самих провайдеров (во избежание циклов)
export { useFirebase, useAuth, useFirestore, useUser, useMemoFirebase } from './provider';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';