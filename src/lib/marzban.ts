/**
 * @fileOverview Marzban API Service Layer (Zero-Trust).
 * Интеграция с API Marzban для управления VLESS профилями.
 */

const MARZBAN_API_URL = process.env.MARZBAN_API_URL || 'http://127.0.0.1:8000';
const USERNAME = process.env.MARZBAN_USERNAME;
const PASSWORD = process.env.MARZBAN_PASSWORD;

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
    console.error('[MARZBAN] Missing credentials in .env');
    throw new Error('Креды Marzban (USERNAME/PASSWORD) не настроены');
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
      throw new Error(`Auth failed (${response.status}): ${err}`);
    }

    const data = await response.json();
    cachedToken = data.access_token;
    tokenExpiration = Date.now() + 15 * 60 * 1000;
    return cachedToken!;
  } catch (error: any) {
    console.error('[MARZBAN] Token Auth Error:', error.message);
    throw error;
  }
}

/**
 * Генерирует пользователя в Marzban
 */
export async function generateMarzbanUser(options: { username: string, dataLimit: number }): Promise<MarzbanProfile> {
  console.log(`[MARZBAN] Syncing user: ${options.username}`);
  
  try {
    const token = await getAdminToken();

    // Пытаемся создать пользователя с поддержкой VLESS
    // Мы НЕ передаем поле inbounds, чтобы Marzban сам выбрал подходящие теги из конфига Xray
    const response = await fetch(`${MARZBAN_API_URL}/api/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        username: options.username,
        data_limit: Math.floor(options.dataLimit),
        proxies: { vless: {} },
        status: "active"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Если юзер уже есть - просто получаем его данные
      if (response.status === 409) {
        return await getMarzbanUser(options.username);
      }
      
      // Если VLESS выключен в Marzban (400) или ошибка валидации (422)
      // Пытаемся создать "пустого" юзера, Marzban сам назначит ему доступные протоколы
      console.warn(`[MARZBAN] VLESS might be restricted. Attempting fallback creation...`);
      const fallbackResponse = await fetch(`${MARZBAN_API_URL}/api/user`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify({ 
           username: options.username, 
           data_limit: Math.floor(options.dataLimit) 
         })
      });

      if (fallbackResponse.ok) {
        return await getMarzbanUser(options.username);
      }

      throw new Error(`Marzban API Error: ${errorText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('[MARZBAN] Operation failed:', error.message);
    throw error;
  }
}

/**
 * Получает данные существующего пользователя
 */
async function getMarzbanUser(username: string): Promise<MarzbanProfile> {
  const token = await getAdminToken();
  const response = await fetch(`${MARZBAN_API_URL}/api/user/${username}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user ${username}: ${response.status}`);
  }
  return await response.json();
}
