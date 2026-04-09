'use client';

import React, { useEffect, useState } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [instance, setInstance] = useState<ReturnType<typeof initializeFirebase> | null>(null);

  useEffect(() => {
    setInstance(initializeFirebase());
  }, []);

  if (!instance) return null;

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
