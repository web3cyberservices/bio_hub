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
 * SAFE FIREBASE SINGLETON ARCHITECTURE
 * Prevents "initializeFirestore() has already been called" error during Fast Refresh and builds.
 */

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, auth: null, firestore: null };
  }

  // 1. App Initialization
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  
  // 2. Auth Initialization
  auth = getAuth(app);
  
  // 3. Robust Firestore Initialization with try/catch Singleton pattern
  try {
    firestore = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  } catch (error: any) {
    // If already initialized, use existing instance
    if (error.message?.includes('already been called') || error.code === 'failed-precondition') {
      firestore = getFirestore(app);
    } else {
      console.warn("[FIREBASE] Init Fallback:", error.message);
      firestore = getFirestore(app);
    }
  }

  return { firebaseApp: app, auth, firestore };
}

// Export a robust DB singleton for use in non-blocking updates
export const db = (() => {
  if (typeof window === 'undefined') return null;
  const { firestore } = initializeFirebase();
  return firestore;
})();

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
