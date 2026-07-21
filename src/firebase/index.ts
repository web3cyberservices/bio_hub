'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth, onAuthStateChanged, type User } from 'firebase/auth';
import { useState, useEffect } from 'react';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

export function initializeFirebase() {
  // Если ключи отсутствуют, не пытаемся инициализировать
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    return { app: null, db: null, auth: null };
  }
  
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } else {
    app = getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);
  }
  return { app, db, auth };
}

export function getSafeDb(): Firestore | null {
  const { db: dbInstance } = initializeFirebase();
  return dbInstance;
}

export function getSafeAuth(): Auth | null {
  const { auth: authInstance } = initializeFirebase();
  return authInstance;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { auth: authInstance } = initializeFirebase();
    if (!authInstance) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(authInstance, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, loading, auth: getSafeAuth() };
}

export function useUser() {
  return useAuth();
}

export function useFirestore() {
  return { db: getSafeDb() };
}