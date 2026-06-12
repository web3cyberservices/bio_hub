'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './index';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * Клиентский провайдер Firebase. 
 * Гарантирует инициализацию только на стороне клиента.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // Инициализируем Firebase строго на стороне клиента один раз.
  const firebaseServices = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}