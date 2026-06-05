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
 * Permanently resolves "initializeFirestore() has already been called" error.
 * Optimized for Next.js 15 Fast Refresh.
 */

let app: FirebaseApp;
let auth: Auth;

export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, auth: null, firestore: null };
  }

  // 1. App Initialization Singleton
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  
  // 2. Auth Initialization Singleton
  auth = getAuth(app);
  
  return { firebaseApp: app, auth };
}

// Global Singleton Instance for Firestore with HMR Protection
export const db = (() => {
  if (typeof window === 'undefined') return null;
  
  const currentApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  
  try {
    // Try primary initialization with persistent cache
    return initializeFirestore(currentApp, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  } catch (error: any) {
    // If already initialized (common during HMR), return the existing instance
    if (error.message?.includes('already been called') || error.code === 'failed-precondition') {
      return getFirestore(currentApp);
    }
    console.error("[FIREBASE] Critical Init Error:", error);
    return getFirestore(currentApp);
  }
})();

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';