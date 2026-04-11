'use client';

import React, { useEffect, useState } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [instance, setInstance] = useState<ReturnType<typeof initializeFirebase> | null>(null);

  useEffect(() => {
    try {
      const firebaseInstance = initializeFirebase();
      setInstance(firebaseInstance);
    } catch (e) {
      console.error('Критическая ошибка инициализации Firebase:', e);
    }
  }, []);

  // ВСЕГДА рендерим детей, чтобы интерфейс не исчезал.
  // Хуки внутри будут получать null, если Firebase не инициализирован.
  return (
    <FirebaseProvider
      firebaseApp={instance?.firebaseApp || null as any}
      firestore={instance?.firestore || null as any}
      auth={instance?.auth || null as any}
    >
      {children}
    </FirebaseProvider>
  );
}
