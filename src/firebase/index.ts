'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

export function initializeFirebase() {
  let firebaseApp: FirebaseApp | null = null;
  let firestore: Firestore | null = null;
  let auth: Auth | null = null;

  // Проверка на наличие конфигурации. 
  // Мы позволяем инициализацию, если есть хотя бы Project ID, чтобы избежать фатальных ошибок.
  const hasConfig = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined' && firebaseConfig.apiKey !== '';

  if (!hasConfig) {
    console.warn('Firebase configuration is missing or incomplete. Please connect your project in the Firebase Studio interface.');
    return { firebaseApp: null, firestore: null, auth: null };
  }

  try {
    firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    firestore = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
  } catch (error) {
    console.error('Failed to initialize Firebase services:', error);
  }

  return { 
    firebaseApp: firebaseApp as FirebaseApp, 
    firestore: firestore as Firestore, 
    auth: auth as Auth 
  };
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './error-emitter';
export * from './errors';
