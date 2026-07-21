
/**
 * @fileOverview Marzban API Service Layer.
 * Handles interaction with the local Marzban REST API.
 */

const MARZBAN_API_URL = process.env.MARZBAN_API_URL || 'http://localhost:8000';

export interface MarzbanUser {
  username: string;
  status: string;
  expire: number;
  links: string[];
}

export async function createMarzbanUser(username: string): Promise<MarzbanUser | null> {
  try {
    const response = await fetch(`${MARZBAN_API_URL}/api/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MARZBAN_ADMIN_TOKEN}`
      },
      body: JSON.stringify({
        username,
        proxies: { vless: {} },
        inbounds: { vless: ["VLESS TCP REALITY"] }
      })
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Marzban Create Error:', error);
    return null;
  }
}

export async function getMarzbanUser(username: string): Promise<MarzbanUser | null> {
  try {
    const response = await fetch(`${MARZBAN_API_URL}/api/user/${username}`, {
      headers: {
        'Authorization': `Bearer ${process.env.MARZBAN_ADMIN_TOKEN}`
      }
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Marzban Get Error:', error);
    return null;
  }
}
