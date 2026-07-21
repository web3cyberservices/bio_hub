
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeFirebase } from './index';

const FirebaseContext = createContext<{ initialized: boolean }>({ initialized: false });

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initializeFirebase();
    setInitialized(true);
  }, []);

  return (
    <FirebaseContext.Provider value={{ initialized }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebaseContext = () => useContext(FirebaseContext);
