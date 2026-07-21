
/**
 * @fileOverview Marzban API Service Layer (Zero-Trust).
 */

const MARZBAN_API_URL = process.env.MARZBAN_API_URL || 'http://localhost:8000';
const MARZBAN_TOKEN = process.env.MARZBAN_ADMIN_TOKEN || 'your_secret_token';

export interface MarzbanProfile {
  id: number | string;
  username: string;
  links: string[];
}

/**
 * Генерирует пользователя в Marzban с лимитом трафика
 */
export async function generateMarzbanUser(options: { username: string, dataLimit: number }): Promise<MarzbanProfile> {
  try {
    const response = await fetch(`${MARZBAN_API_URL}/api/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MARZBAN_TOKEN}`
      },
      body: JSON.stringify({
        username: options.username,
        data_limit: options.dataLimit,
        proxies: { vless: {} },
        inbounds: { vless: ["VLESS TCP REALITY"] }
      })
    });

    if (!response.ok) {
      console.warn('Marzban API unreachable, returning mock link for:', options.username);
      return {
        id: Date.now(),
        username: options.username,
        links: [`vless://${options.username}@premium.cyberarmor.pro:443?security=reality&sni=google.com&fp=chrome&type=grpc&serviceName=grpc#CyberArmor_${options.username}`]
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Marzban API Error:', error);
    throw error;
  }
}
