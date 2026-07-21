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

    // Минимальный payload. Мы НЕ указываем inbounds, чтобы не ловить 422.
    // Marzban сам назначит доступные прокси, если они включены.
    const response = await fetch(`${MARZBAN_API_URL}/api/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        username: options.username,
        data_limit: Math.floor(options.dataLimit),
        proxies: { vless: {} }, // Запрашиваем VLESS. Если на сервере его нет, Marzban вернет 400.
        status: "active"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      if (response.status === 409) {
        return await getMarzbanUser(options.username);
      }
      
      // Если VLESS выключен (400), попробуем создать без привязки к прокси, чтобы просто создать юзера
      if (response.status === 400 && errorText.includes('disabled')) {
        console.warn(`[MARZBAN] VLESS is disabled on server. Creating user without proxies...`);
        const fallbackResponse = await fetch(`${MARZBAN_API_URL}/api/user`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
           body: JSON.stringify({ username: options.username, data_limit: Math.floor(options.dataLimit) })
        });
        if (fallbackResponse.ok) return await fallbackResponse.json();
      }

      throw new Error(`Marzban API ${response.status}: ${errorText}`);
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
