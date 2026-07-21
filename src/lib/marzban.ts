/**
 * @fileOverview Marzban API Service Layer (Zero-Trust).
 * Интеграция с API Marzban для управления VLESS профилями.
 */

const MARZBAN_API_URL = (process.env.MARZBAN_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const USERNAME = process.env.MARZBAN_USERNAME;
const PASSWORD = process.env.MARZBAN_PASSWORD;

let cachedToken: string | null = null;
let tokenExpiration: number = 0;

export interface MarzbanProfile {
  id: number | string;
  username: string;
  links: string[];
  status: string;
  proxies?: any;
}

async function getAdminToken(force = false): Promise<string> {
  if (!force && cachedToken && Date.now() < tokenExpiration) {
    return cachedToken;
  }

  if (!USERNAME || !PASSWORD) {
    throw new Error('Креды Marzban (USERNAME/PASSWORD) не настроены в .env');
  }

  const formData = new URLSearchParams();
  formData.append('username', USERNAME);
  formData.append('password', PASSWORD);

  const response = await fetch(`${MARZBAN_API_URL}/api/admin/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString()
  });

  if (!response.ok) {
    throw new Error(`Auth failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiration = Date.now() + 15 * 60 * 1000;
  return cachedToken!;
}

export async function generateMarzbanUser(options: { username: string, dataLimit: number }): Promise<MarzbanProfile> {
  console.log(`[MARZBAN] Синхронизация пользователя: ${options.username}`);
  const token = await getAdminToken();

  const payload = {
    username: options.username,
    data_limit: Math.floor(options.dataLimit),
    proxies: { vless: {} },
    status: "active"
  };

  // 1. Пытаемся создать пользователя
  const createRes = await fetch(`${MARZBAN_API_URL}/api/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!createRes.ok && createRes.status !== 409) {
    const errorText = await createRes.text();
    console.error(`[MARZBAN] Create error: ${createRes.status} ${errorText}`);
    
    // Если ошибка 422 или 400, пробуем создать без указания прокси (Marzban сам назначит дефолтные)
    if (createRes.status === 422 || createRes.status === 400) {
        await fetch(`${MARZBAN_API_URL}/api/user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ username: options.username, data_limit: payload.data_limit })
        });
    }
  }

  // 2. Если пользователь уже был, принудительно включаем VLESS (на случай если он был выключен)
  if (createRes.status === 409) {
    await fetch(`${MARZBAN_API_URL}/api/user/${options.username}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ proxies: { vless: {} }, data_limit: payload.data_limit })
    });
  }

  // 3. Всегда запрашиваем профиль через GET, так как только этот эндпоинт стабильно возвращает ссылки
  return await getMarzbanUser(options.username);
}

export async function getMarzbanUser(username: string): Promise<MarzbanProfile> {
  const token = await getAdminToken();
  const response = await fetch(`${MARZBAN_API_URL}/api/user/${username}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) {
    if (response.status === 401) {
        const freshToken = await getAdminToken(true);
        const retry = await fetch(`${MARZBAN_API_URL}/api/user/${username}`, {
          headers: { 'Authorization': `Bearer ${freshToken}` }
        });
        if (!retry.ok) throw new Error(`User fetch failed: ${retry.status}`);
        return await retry.json();
    }
    throw new Error(`Failed to fetch user ${username}: ${response.status}`);
  }
  
  const data = await response.json();
  console.log(`[MARZBAN] Профиль получен для ${username}, ссылок: ${data.links?.length || 0}`);
  return data;
}