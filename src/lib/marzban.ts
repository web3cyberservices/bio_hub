/**
 * @fileOverview Marzban API Service Layer (Zero-Trust).
 * Оптимизированная интеграция с поддержкой автоматической отладки ошибок 400/422.
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
 * Получает токен. В случае 401 сбрасывает кэш.
 */
async function getAdminToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && cachedToken && Date.now() < tokenExpiration) {
    return cachedToken;
  }

  if (!USERNAME || !PASSWORD) {
    throw new Error('Креды Marzban (USERNAME/PASSWORD) не настроены в .env');
  }

  const formData = new URLSearchParams();
  formData.append('username', USERNAME);
  formData.append('password', PASSWORD);

  console.log(`[MARZBAN] Auth request to ${MARZBAN_API_URL}`);
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
}

/**
 * Генерирует пользователя. Если VLESS отклоняется сервером (400/422),
 * делает fallback на создание без прокси, чтобы избежать "заглушек".
 */
export async function generateMarzbanUser(options: { username: string, dataLimit: number }): Promise<MarzbanProfile> {
  console.log(`[MARZBAN] Syncing user: ${options.username}`);
  const token = await getAdminToken();

  // 1. Попытка создать/обновить с VLESS
  const createPayload = {
    username: options.username,
    data_limit: Math.floor(options.dataLimit),
    proxies: { vless: {} },
    status: "active"
  };

  let response = await fetch(`${MARZBAN_API_URL}/api/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(createPayload)
  });

  // Если юзер уже есть
  if (response.status === 409) {
    return await getMarzbanUser(options.username);
  }

  // Если 400 или 422 (VLESS disabled или плохой inbound)
  if (!response.ok && (response.status === 422 || response.status === 400)) {
    console.warn(`[MARZBAN] Server rejected VLESS config (Status ${response.status}). Trying fallback...`);
    
    // Fallback: создаем "голого" юзера, Marzban сам применит доступные протоколы
    const fallbackResponse = await fetch(`${MARZBAN_API_URL}/api/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        username: options.username,
        data_limit: Math.floor(options.dataLimit)
      })
    });

    if (!fallbackResponse.ok && fallbackResponse.status !== 409) {
      throw new Error(`Marzban API Error: ${await fallbackResponse.text()}`);
    }
  } else if (!response.ok) {
    const errorMsg = await response.text();
    throw new Error(`Marzban API Error (${response.status}): ${errorMsg}`);
  }

  return await getMarzbanUser(options.username);
}

async function getMarzbanUser(username: string): Promise<MarzbanProfile> {
  const token = await getAdminToken();
  const response = await fetch(`${MARZBAN_API_URL}/api/user/${username}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) {
    if (response.status === 401) {
       // Пробуем обновить токен один раз
       const newToken = await getAdminToken(true);
       const retry = await fetch(`${MARZBAN_API_URL}/api/user/${username}`, {
         headers: { 'Authorization': `Bearer ${newToken}` }
       });
       if (!retry.ok) throw new Error(`User fetch failed: ${retry.status}`);
       return await retry.json();
    }
    throw new Error(`Failed to fetch user ${username}: ${response.status}`);
  }
  return await response.json();
}