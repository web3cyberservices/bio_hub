/**
 * @fileOverview Marzban API Service Layer (Zero-Trust).
 * Интеграция с API Marzban для управления VLESS профилями.
 */

const MARZBAN_API_URL = process.env.MARZBAN_API_URL || 'http://127.0.0.1:8000';
const USERNAME = process.env.MARZBAN_USERNAME;
const PASSWORD = process.env.MARZBAN_PASSWORD;

// In-Memory Cache для токена
let cachedToken: string | null = null;
let tokenExpiration: number = 0;

export interface MarzbanProfile {
  id: number | string;
  username: string;
  links: string[];
  status: string;
}

/**
 * Получает и кэширует Bearer-токен от Marzban API
 */
async function getAdminToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiration) {
    return cachedToken;
  }

  if (!USERNAME || !PASSWORD) {
    console.error('[MARZBAN] Ошибка: Не заданы MARZBAN_USERNAME или MARZBAN_PASSWORD в .env');
    throw new Error('Креды администратора не настроены на сервере');
  }

  const formData = new URLSearchParams();
  formData.append('username', USERNAME);
  formData.append('password', PASSWORD);

  try {
    const response = await fetch(`${MARZBAN_API_URL}/api/admin/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`[MARZBAN] Ошибка авторизации (${response.status}): ${err}`);
      throw new Error(`Ошибка авторизации в API: ${response.status}`);
    }

    const data = await response.json();
    cachedToken = data.access_token;
    tokenExpiration = Date.now() + 15 * 60 * 1000; // 15 mins
    return cachedToken!;
  } catch (error: any) {
    console.error('[MARZBAN] Auth Exception:', error.message);
    throw error;
  }
}

/**
 * Генерирует пользователя в Marzban
 */
export async function generateMarzbanUser(options: { username: string, dataLimit: number }): Promise<MarzbanProfile> {
  console.log(`[MARZBAN] Запрос на создание/синхронизацию: ${options.username}`);
  
  try {
    const token = await getAdminToken();

    // Удаляем конкретный инбаунд "VLESS TCP REALITY", так как он может называться иначе на сервере.
    // Оставляем пустой объект или список, чтобы Marzban использовал дефолтные активные инбаунды.
    const response = await fetch(`${MARZBAN_API_URL}/api/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        username: options.username,
        data_limit: options.dataLimit,
        proxies: { vless: {} },
        // Передаем пустые массивы, чтобы Marzban автоматически назначил все доступные инбаунды для этих протоколов
        inbounds: { vless: [] }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // 409 Conflict = User exists, just fetch it
      if (response.status === 409) {
        console.log(`[MARZBAN] Пользователь ${options.username} уже существует, получаем данные...`);
        return await getMarzbanUser(options.username);
      }
      
      console.error(`[MARZBAN] Ошибка API (${response.status}): ${errorText}`);
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log(`[MARZBAN] Пользователь ${options.username} успешно создан.`);
    return result;
  } catch (error: any) {
    console.error('[MARZBAN] Критическая ошибка генерации:', error.message);
    throw error;
  }
}

/**
 * Получает данные существующего пользователя
 */
async function getMarzbanUser(username: string): Promise<MarzbanProfile> {
  const token = await getAdminToken();
  try {
    const response = await fetch(`${MARZBAN_API_URL}/api/user/${username}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Не удалось получить данные пользователя: ${response.status}`);
    }
    return await response.json();
  } catch (e: any) {
    console.error(`[MARZBAN] Ошибка при получении юзера ${username}:`, e.message);
    throw e;
  }
}