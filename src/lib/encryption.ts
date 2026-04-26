/**
 * @fileOverview Модуль клиентского шифрования данных BioTech.
 * Использует Web Crypto API для обеспечения защиты данных на устройстве пользователя.
 */

const ENCRYPTION_KEY_PREFIX = 'pb_secret_';

/**
 * Генерирует или извлекает ключ шифрования, привязанный к сессии пользователя.
 * В реальной системе ключ должен храниться в защищенном хранилище или Vault.
 */
async function getEncryptionKey(userId: string): Promise<CryptoKey> {
  const compositeKey = `${ENCRYPTION_KEY_PREFIX}${userId}`;
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(compositeKey.padEnd(32, '0').slice(0, 32)),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('bio-tech-salt-2024'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Шифрует строку данных с использованием AES-256-GCM.
 */
export async function encryptSensitiveData(data: string, userId: string): Promise<string> {
  if (!data) return '';
  try {
    const key = await getEncryptionKey(userId);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);

    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );

    const encryptedArray = new Uint8Array(encryptedContent);
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv);
    combined.set(encryptedArray, iv.length);

    return btoa(String.fromCharCode.apply(null, Array.from(combined)));
  } catch (e) {
    console.error('Encryption failed:', e);
    return data;
  }
}

/**
 * Дешифрует данные на стороне клиента.
 */
export async function decryptSensitiveData(encryptedBase64: string, userId: string): Promise<string> {
  if (!encryptedBase64 || !encryptedBase64.includes('=')) return encryptedBase64;
  try {
    const key = await getEncryptionKey(userId);
    const combined = new Uint8Array(atob(encryptedBase64).split('').map(c => c.charCodeAt(0)));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decryptedContent = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedContent);
  } catch (e) {
    return 'Decryption Error: Invalid Key or Corrupted Data';
  }
}
