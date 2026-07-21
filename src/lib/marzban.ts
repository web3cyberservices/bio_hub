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

/**
 * Получение токена администратора (OAuth2 Password Flow)
 */
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
    body: formData.toString(),
    cache: 'no-store'
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`[MARZBAN AUTH ERROR] ${response.status}: ${errText}`);
    throw new Error(`Auth failed: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiration = Date.now() + 15 * 60 * 1000;
  return cachedToken!;
}

/**
 * Синхронизация пользователя с Marzban (Создание или Обновление)
 */
export async function generateMarzbanUser(options: { username: string, dataLimit: number }): Promise<MarzbanProfile> {
  console.log(`[MARZBAN] Синхронизация пользователя: ${options.username}`);
  const token = await getAdminToken();

  // Payload с жесткой привязкой к тегу из вашего конфига
  const payload = {
    username: options.username,
    data_limit: Math.floor(options.dataLimit),
    proxies: { 
      vless: {} 
    },
    inbounds: {
      vless: ["VLESS TCP REALITY"] // Точное имя тега из вашего xray_config.json
    },
    status: "active"
  };

  // 1. Пытаемся создать пользователя
  const createRes = await fetch(`${MARZBAN_API_URL}/api/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload),
    cache: 'no-store'
  });

  if (createRes.status === 409) {
    // 2. Если пользователь уже существует, обновляем его настройки (PUT)
    console.log(`[MARZBAN] Пользователь существует, обновляем профиль: ${options.username}`);
    const updateRes = await fetch(`${MARZBAN_API_URL}/api/user/${options.username}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
      cache: 'no-store'
    });
    
    if (!updateRes.ok) {
      const err = await updateRes.text();
      throw new Error(`API Update Error ${updateRes.status}: ${err}`);
    }
  } else if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`API Create Error ${createRes.status}: ${errorText}`);
  }

  // 3. Финальный GET запрос для получения актуальных ссылок (Links часто не возвращаются в POST/PUT)
  return await getMarzbanUser(options.username);
}

/**
 * Получение данных пользователя (без кэширования Next.js)
 */
export async function getMarzbanUser(username: string): Promise<MarzbanProfile> {
  const token = await getAdminToken();
  const response = await fetch(`${MARZBAN_API_URL}/api/user/${username}`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    },
    cache: 'no-store' // КРИТИЧЕСКИ ВАЖНО для Next.js 15
  });
  
  if (!response.ok) {
    if (response.status === 401) {
        const freshToken = await getAdminToken(true);
        const retry = await fetch(`${MARZBAN_API_URL}/api/user/${username}`, {
          headers: { 'Authorization': `Bearer ${freshToken}` },
          cache: 'no-store'
        });
        if (!retry.ok) throw new Error(`User fetch failed after retry: ${retry.status}`);
        return await retry.json();
    }
    throw new Error(`Failed to fetch user ${username}: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
}
