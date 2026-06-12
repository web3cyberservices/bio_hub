
'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect, DependencyList } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

export interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);
const GUEST_USER = { uid: 'public-user', displayName: 'Гость' };

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userState, setUserState] = useState<{user: User | null, loading: boolean, error: Error | null}>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!auth) {
      setUserState({ user: null, loading: false, error: null });
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (u) => setUserState({ user: u, loading: false, error: null }),
      (e) => setUserState({ user: null, loading: false, error: e as Error })
    );
    return () => unsubscribe();
  }, [auth]);

  const value = useMemo(() => ({
    areServicesAvailable: !!(firebaseApp && firestore && auth),
    firebaseApp,
    firestore,
    auth,
    user: userState.user,
    isUserLoading: userState.loading,
    userError: userState.error,
  }), [firebaseApp, firestore, auth, userState]);

  return (
    <FirebaseContext.Provider value={value}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) return { areServicesAvailable: false, firebaseApp: null, firestore: null, auth: null, user: null, isUserLoading: true, userError: null };
  return context;
};

export const useAuth = () => {
  const { auth } = useFirebase();
  return { auth };
};

export const useFirestore = () => {
  const { firestore } = useFirebase();
  return { firestore };
};

export const useUser = () => {
  const { user, isUserLoading, userError } = useFirebase();
  const finalUser = isUserLoading ? null : (user || GUEST_USER);
  return { user: finalUser as any, loading: isUserLoading, isUserLoading, userError };
};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T & {__memo?: boolean} {
  const memoized = useMemo(factory, deps);
  const result = memoized as any;
  if (result && typeof result === 'object') result.__memo = true;
  return result;
}
