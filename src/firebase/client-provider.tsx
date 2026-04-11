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
      console.error('Critical error in FirebaseClientProvider:', e);
    }
  }, []);

  // Мы ВСЕГДА рендерим провайдер, чтобы хуки useAuth/useFirestore не возвращали ошибку контекста
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
