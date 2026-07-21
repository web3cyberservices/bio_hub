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
    body: formData.toString(),
    cache: 'no-store'
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

  // Жестко задаем структуру для предотвращения деструктивной мутации
  const payload = {
    username: options.username,
    data_limit: Math.floor(options.dataLimit),
    proxies: { 
      vless: {} 
    },
    inbounds: { 
      vless: ["VLESS TCP REALITY"] 
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

  // 2. Если пользователь уже существует (409), обновляем его (PUT) с тем же payload
  if (createRes.status === 409) {
    console.log(`[MARZBAN] Пользователь существует, обновляем: ${options.username}`);
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
      console.error(`[MARZBAN] Update error: ${updateRes.status} ${err}`);
      throw new Error(`API Error ${updateRes.status}: ${err}`);
    }
  } else if (!createRes.ok) {
    const errorText = await createRes.text();
    console.error(`[MARZBAN] Create error: ${createRes.status} ${errorText}`);
    throw new Error(`API Error ${createRes.status}: ${errorText}`);
  }

  // 3. Всегда запрашиваем профиль через GET, чтобы получить свежие ссылки (links)
  return await getMarzbanUser(options.username);
}

export async function getMarzbanUser(username: string): Promise<MarzbanProfile> {
  const token = await getAdminToken();
  const response = await fetch(`${MARZBAN_API_URL}/api/user/${username}`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    },
    cache: 'no-store'
  });
  
  if (!response.ok) {
    if (response.status === 401) {
        const freshToken = await getAdminToken(true);
        const retry = await fetch(`${MARZBAN_API_URL}/api/user/${username}`, {
          headers: { 'Authorization': `Bearer ${freshToken}` },
          cache: 'no-store'
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
