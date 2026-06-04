/**
 * @fileOverview Мост для связи с нативным Android API (Health Connect).
 * Используется в режиме TWA для бесшовного получения биометрии.
 */

export interface HealthMetrics {
  steps?: number;
  heartRate?: number;
  sleepHours?: number;
  weight?: number;
  lastSync?: string;
}

/**
 * Проверяет, запущен ли сервис в нативном контейнере Android с поддержкой моста.
 */
export const isNativeBridgeAvailable = () => {
  return typeof window !== 'undefined' && (window as any).HealthConnectBridge !== undefined;
};

/**
 * Вызывает системное окно Android для запроса разрешений Health Connect.
 * ОС Android выдаст запрос: «Разрешить приложению PRO_СЕБЯ_HEALTH доступ к данным...»
 */
export const requestNativePermissions = async (): Promise<boolean> => {
  if (!isNativeBridgeAvailable()) return false;
  try {
    // Вызов нативного метода (инжектится через WebView.addJavascriptInterface)
    const result = await (window as any).HealthConnectBridge.requestPermissions();
    return result === true || result === 'true';
  } catch (e) {
    console.error("[HEALTH-BRIDGE] Permission Error:", e);
    return false;
  }
};

/**
 * Получает агрегированные данные из Health Connect.
 */
export const fetchNativeHealthData = async (): Promise<HealthMetrics | null> => {
  if (!isNativeBridgeAvailable()) return null;
  try {
    const dataStr = await (window as any).HealthConnectBridge.getHealthData();
    if (!dataStr) return null;
    
    const parsed = JSON.parse(dataStr);
    return {
      steps: parsed.steps || 0,
      heartRate: parsed.heartRate || 0,
      sleepHours: parsed.sleepHours || 0,
      weight: parsed.weight || 0,
      lastSync: new Date().toISOString()
    };
  } catch (e) {
    console.error("[HEALTH-BRIDGE] Data Fetch Error:", e);
    return null;
  }
};
