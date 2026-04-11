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

  // Если Firebase не инициализирован (нет конфига), все равно рендерим дочерние элементы
  if (!instance || !instance.firebaseApp) {
    return <>{children}</>;
  }

  return (
    <FirebaseProvider
      firebaseApp={instance.firebaseApp}
      firestore={instance.firestore}
      auth={instance.auth}
    >
      {children}
    </FirebaseProvider>
  );
}
