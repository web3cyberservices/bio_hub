'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../provider';

/**
 * Хук для получения пользователя.
 * Если Auth не настроен, возвращает "публичного" пользователя для беспрепятственного входа.
 */
export function useUser() {
  const { auth } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Если Firebase Auth не инициализирован, создаем виртуального пользователя
    if (!auth) {
      setUser({ uid: 'public-user', displayName: 'Гость' });
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Всегда даем доступ, даже без входа
        setUser({ uid: 'public-user', displayName: 'Гость' });
      }
      setLoading(false);
    }, (error) => {
      setUser({ uid: 'public-user', displayName: 'Гость' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
}
