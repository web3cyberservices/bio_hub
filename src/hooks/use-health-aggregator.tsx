'use client';

import { useEffect, useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { syncGoogleFitData } from '@/app/actions/sync-google-fit';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { isNativeBridgeAvailable, fetchNativeHealthData } from '@/lib/health-bridge';

/**
 * Хук-агрегатор для PWA/TWA. 
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

      setIsSyncing(true);
      try {
        const dateKey = format(new Date(), 'yyyy-MM-dd');
        const dailyRef = doc(firestore, 'users', user.uid, 'dailyLogs', dateKey);

        // 1. ПРИОРИТЕТ: Нативный мост (Android TWA)
        if (isNativeBridgeAvailable()) {
          const nativeData = await fetchNativeHealthData();
          if (nativeData) {
            await setDoc(dailyRef, {
              steps: nativeData.steps || undefined,
              avgHeartRate: nativeData.heartRate || undefined,
              sleepDurationHours: nativeData.sleepHours || undefined,
              updatedAt: serverTimestamp(),
              syncSource: 'native_bridge'
            }, { merge: true });
            console.log('[HEALTH-AGGREGATOR] Native sync success');
            setIsSyncing(false);
            return;
          }
        }

        // 2. РЕЗЕРВ: Облачная синхронизация Google Fit (если есть токен)
        const token = sessionStorage.getItem('google_fit_token');
        if (token) {
          const userRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          const lastSync = userDoc.data()?.lastHealthSync;
          const startTime = lastSync ? new Date(lastSync).getTime() : Date.now() - 3600000;

          const rawData = await syncGoogleFitData(token, startTime);
          
          await setDoc(dailyRef, {
            steps: rawData.steps || undefined,
            avgHeartRate: rawData.heartRate || undefined,
            sleepDurationHours: rawData.sleepHours || undefined,
            updatedAt: serverTimestamp(),
            syncSource: 'cloud_fit'
          }, { merge: true });

          await setDoc(userRef, { lastHealthSync: new Date().toISOString() }, { merge: true });
          console.log('[HEALTH-AGGREGATOR] Cloud sync success');
        }
      } catch (e) {
        console.error('[HEALTH-AGGREGATOR] Sync error:', e);
      } finally {
        setIsSyncing(false);
      }
    };

    triggerBackgroundSync();
  }, [user, firestore]);

  return { isSyncing };
}
