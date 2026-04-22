
'use server';

/**
 * @fileOverview Server Action для получения данных из Google Fitness REST API.
 */

interface GoogleFitSyncResult {
  steps: number;
  calories: number;
  sleepHours: number;
  heartRate: number;
}

export async function syncGoogleFitData(accessToken: string): Promise<GoogleFitSyncResult> {
  const endTime = Date.now();
  const startTime = endTime - 24 * 60 * 60 * 1000; // Последние 24 часа

  const aggregateRequest = {
    aggregateBy: [
      {
        dataTypeName: "com.google.step_count.delta",
        dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
      },
      {
        dataTypeName: "com.google.calories.expended",
        dataSourceId: "derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended"
      },
      {
        dataTypeName: "com.google.heart_rate.bpm",
        dataSourceId: "derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm"
      }
    ],
    bucketByTime: { durationMillis: 86400000 },
    startTimeMillis: startTime,
    endTimeMillis: endTime
  };

  try {
    const response = await fetch("https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(aggregateRequest)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Ошибка Google Fit API");
    }

    const data = await response.json();
    
    // Парсим результат агрегации
    let steps = 0;
    let calories = 0;
    let heartRate = 0;

    const bucket = data.bucket?.[0];
    if (bucket && bucket.dataset) {
      bucket.dataset.forEach((ds: any) => {
        const point = ds.point?.[0];
        if (point && point.value?.[0]) {
          const val = point.value[0].intVal || point.value[0].fpVal || 0;
          if (ds.dataSourceId.includes("step_count")) steps = val;
          if (ds.dataSourceId.includes("calories")) calories = Math.round(val);
          if (ds.dataSourceId.includes("heart_rate")) heartRate = Math.round(val);
        }
      });
    }

    // Запрос на данные о сне (отдельный endpoint для сессий)
    const sleepResponse = await fetch(
      `https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${new Date(startTime).toISOString()}&endTime=${new Date(endTime).toISOString()}&type=72`,
      {
        headers: { "Authorization": `Bearer ${accessToken}` }
      }
    );
    
    let sleepHours = 0;
    if (sleepResponse.ok) {
      const sleepData = await sleepResponse.json();
      if (sleepData.session) {
        const totalMs = sleepData.session.reduce((acc: number, s: any) => {
          return acc + (Number(s.endTimeMillis) - Number(s.startTimeMillis));
        }, 0);
        sleepHours = Number((totalMs / (1000 * 60 * 60)).toFixed(1));
      }
    }

    return {
      steps: steps || 0,
      calories: calories || 0,
      sleepHours: sleepHours || 0,
      heartRate: heartRate || 0
    };
  } catch (error: any) {
    console.error("Google Fit Sync Error:", error);
    throw new Error(error.message || "Не удалось синхронизировать биометрию");
  }
}
