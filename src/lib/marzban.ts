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
    throw new Error('MARZBAN_USERNAME or MARZBAN_PASSWORD is not set in environment variables');
  }

  console.log(`[MARZBAN] Authenticating at ${MARZBAN_API_URL}...`);
  
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
      throw new Error(`Authentication failed: ${response.status} ${err}`);
    }

    const data = await response.json();
    cachedToken = data.access_token;
    tokenExpiration = Date.now() + 15 * 60 * 1000; // 15 mins
    return cachedToken!;
  } catch (error: any) {
    console.error('[MARZBAN] Auth Error:', error.message);
    throw error;
  }
}

/**
 * Генерирует пользователя в Marzban
 */
export async function generateMarzbanUser(options: { username: string, dataLimit: number }): Promise<MarzbanProfile> {
  console.log(`[MARZBAN] Creating/Syncing user: ${options.username}`);
  
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
      
      // 409 Conflict = User exists, just fetch it
      if (response.status === 409) {
        console.log(`[MARZBAN] User ${options.username} exists, fetching data...`);
        return await getMarzbanUser(options.username);
      }
      
      throw new Error(`Marzban API Error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.log(`[MARZBAN] User ${options.username} created successfully.`);
    return result;
  } catch (error: any) {
    console.error('[MARZBAN] User Generation Error:', error.message);
    // Rethrow to let action handle it
    throw error;
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
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Marzban user: ${response.status}`);
  }
  return await response.json();
}