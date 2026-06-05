'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager
} from 'firebase/firestore';

/**
 * SAFE FIREBASE SINGLETON ARCHITECTURE
 * Permanently resolves "initializeFirestore() has already been called" error.
 * Optimized for Next.js Fast Refresh and Turbopack.
 */

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Global Singleton Instance for Firestore with HMR Protection
export const db = (() => {
  if (typeof window === 'undefined') return null;
  
  try {
    // Try primary initialization with persistent cache
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  } catch (error: any) {
    // If already initialized (common during HMR), return the existing instance
    if (error.message?.includes('already been called') || error.code === 'failed-precondition') {
      return getFirestore(app);
    }
    console.warn("[FIREBASE] Init recovery triggered:", error.message);
    return getFirestore(app);
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