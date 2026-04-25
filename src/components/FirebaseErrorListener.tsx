'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * Хук-слушатель глобальных ошибок Firebase.
 * Больше не выбрасывает ошибку (throw), а показывает информативное уведомление.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.warn("Firebase Permission Denied:", error.request);
      
      toast({
        variant: 'destructive',
        title: 'Доступ ограничен',
        description: 'Ваш запрос отклонен системой безопасности. Попробуйте войти заново или обратитесь в поддержку.',
      });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}
