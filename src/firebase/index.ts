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
 * SAFE FIREBASE SINGLETON ARCHITECTURE
 * Permanently resolves "initializeFirestore() has already been called" error.
 * Optimized for Next.js 16 Fast Refresh and Turbopack.
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

  authInstance = getAuth(app);
  
  try {
    // Try primary initialization with persistent cache
    dbInstance = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  } catch (error: any) {
    // If already initialized (common during HMR), return the existing instance
    dbInstance = getFirestore(app);
  }

  return { firebaseApp: app, auth: authInstance, firestore: dbInstance };
}

// Legacy constant exports for components that don't use the provider
export const auth = typeof window !== 'undefined' ? getAuth(getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)) : null as unknown as Auth;
export const db = typeof window !== 'undefined' ? (getApps().length > 0 ? getFirestore(getApp()) : null as unknown as Firestore) : null as unknown as Firestore;

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
