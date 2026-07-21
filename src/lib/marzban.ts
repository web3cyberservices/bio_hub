/**
 * @fileOverview Marzban API Service Layer (Zero-Trust).
 * Интеграция с API Marzban для управления VLESS профилями.
 */

const MARZBAN_API_URL = process.env.MARZBAN_API_URL || 'http://127.0.0.1:8000';
const USERNAME = process.env.MARZBAN_USERNAME;
const PASSWORD = process.env.MARZBAN_PASSWORD;

// In-Memory Cache для токена (экономит ОЗУ и I/O)
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
    console.error('[MARZBAN] Missing credentials: MARZBAN_USERNAME or MARZBAN_PASSWORD not set in environment.');
    throw new Error('[MARZBAN] Missing credentials in .env');
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
      throw new Error(`Auth failed: ${response.status} ${err}`);
    }

    const data = await response.json();
    cachedToken = data.access_token;
    tokenExpiration = Date.now() + 15 * 60 * 1000; // Кэшируем на 15 минут
    return cachedToken!;
  } catch (error: any) {
    console.error('[MARZBAN] Auth request failed:', error.message);
    throw error;
  }
}

/**
 * Генерирует пользователя в Marzban с лимитом трафика
 */
export async function generateMarzbanUser(options: { username: string, dataLimit: number }): Promise<MarzbanProfile> {
  console.log(`[MARZBAN] Попытка создания пользователя: ${options.username}`);
  
  try {
    const token = await getAdminToken();

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
        inbounds: { vless: ["VLESS TCP REALITY"] }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Если юзер уже существует (409)
      if (response.status === 409) {
        console.log(`[MARZBAN] Пользователь ${options.username} уже существует, получаем данные...`);
        return await getMarzbanUser(options.username);
      }
      
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log(`[MARZBAN] Пользователь ${options.username} успешно создан.`);
    return result;
  } catch (error: any) {
    console.error('[MARZBAN] Request Failed:', error.message);
    
    // Fallback заглушка при отвале ядра
    return {
      id: `error_${Date.now()}`,
      username: options.username,
      status: 'offline_mode',
      links: [`vless://${options.username}@premium.cyberarmor.pro:443?security=reality&sni=google.com&fp=chrome&type=grpc&serviceName=grpc#CyberArmor_VPN_${options.username}`]
    };
  }
}

/**
 * Получает данные существующего пользователя
 */
async function getMarzbanUser(username: string): Promise<MarzbanProfile> {
  const token = await getAdminToken();
  const response = await fetch(`${MARZBAN_API_URL}/api/user/${username}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) throw new Error('Failed to fetch existing Marzban user');
  return await response.json();
}
