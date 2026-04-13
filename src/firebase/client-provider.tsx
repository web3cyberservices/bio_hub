'use client';

import React, { useEffect, useState } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

/**
 * Провайдер, который инициализирует Firebase на стороне клиента.
 * Не блокирует рендеринг детей (NavBar и т.д.), даже если Firebase еще не настроен.
 */
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [instance, setInstance] = useState<ReturnType<typeof initializeFirebase> | null>(null);

  useEffect(() => {
    const firebaseInstance = initializeFirebase();
    setInstance(firebaseInstance);
  }, []);

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
