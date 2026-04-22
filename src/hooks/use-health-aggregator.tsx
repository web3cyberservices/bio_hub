
'use client';

import { useEffect, useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { syncGoogleFitData } from '@/app/actions/sync-google-fit';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

/**
 * Хук-агрегатор для PWA. 
 * Реализует фоновую синхронизацию данных при входе в приложение.
 */
export function useHealthAggregator() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const triggerBackgroundSync = async () => {
      if (!user || user.uid === 'public-user' || !firestore) return;

      const token = sessionStorage.getItem('google_fit_token');
      if (!token) return;

      setIsSyncing(true);
      try {
        // 1. Проверяем время последней синхронизации
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        const lastSync = userDoc.data()?.lastHealthSync;
        const startTime = lastSync ? new Date(lastSync).getTime() : Date.now() - 3600000; // 1 час назад если нет данных

        // 2. Подтягиваем данные из Google Fit (включает данные из Health Connect)
        const rawData = await syncGoogleFitData(token, startTime);

        // 3. Сохраняем в rawDeviceData для Bio-Hub
        const dateKey = format(new Date(), 'yyyy-MM-dd-HH-mm');
        const rawRef = doc(firestore, 'users', user.uid, 'rawDeviceData', dateKey);
        
        await setDoc(rawRef, {
          ...rawData,
          userId: user.uid,
          timestamp: serverTimestamp(),
          clientPlatform: navigator.platform,
          userAgent: navigator.userAgent
        });

        // 4. Дублируем в dailyLogs для обновления дашборда
        const dailyKey = format(new Date(), 'yyyy-MM-dd');
        const dailyRef = doc(firestore, 'users', user.uid, 'dailyLogs', dailyKey);
        await setDoc(dailyRef, {
          steps: rawData.steps || undefined,
          avgHeartRate: rawData.heartRate || undefined,
          sleepDurationHours: rawData.sleepHours || undefined,
          updatedAt: serverTimestamp()
        }, { merge: true });

        // Обновляем время последней синхронизации в профиле
        await setDoc(userRef, { lastHealthSync: new Date().toISOString() }, { merge: true });

        console.log('--- Health Aggregator: Background sync completed ---');
      } catch (e) {
        console.error('--- Health Aggregator: Sync failed ---', e);
      } finally {
        setIsSyncing(false);
      }
    };

    triggerBackgroundSync();
  }, [user, firestore]);

  return { isSyncing };
}
