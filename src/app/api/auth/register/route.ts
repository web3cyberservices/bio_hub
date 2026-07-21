import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';

/**
 * Валидация данных Telegram Web App
 */
function validateTelegramData(initData: string, botToken: string): boolean {
  if (!initData) return false;
  
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');

  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(calculatedHash), Buffer.from(hash!));
}

export async function POST(req: Request) {
  try {
    const { username, password, initData } = await req.json();

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    // В режиме разработки, если токен не задан, можно пропустить валидацию для тестов
    // В продакшене это обязательно.
    if (process.env.NODE_ENV === 'production' || botToken) {
      if (!botToken) {
        return NextResponse.json({ error: 'Сервер не настроен (BOT_TOKEN)' }, { status: 500 });
      }
      if (!validateTelegramData(initData, botToken)) {
        return NextResponse.json({ error: 'Ошибка безопасности Telegram' }, { status: 403 });
      }
    }

    // Извлекаем ID из initData
    const urlParams = new URLSearchParams(initData);
    const userJson = urlParams.get('user');
    if (!userJson) throw new Error("Данные пользователя отсутствуют");
    
    const tgUser = JSON.parse(userJson);
    const telegramId = tgUser.id;

    // Проверяем, существует ли пользователь с таким TG ID
    const existingTg: any = db.prepare('SELECT * FROM users WHERE tg_id = ?').get(telegramId);
    if (existingTg) {
      return NextResponse.json({ error: 'Этот Telegram аккаунт уже зарегистрирован' }, { status: 400 });
    }

    // Проверяем username
    const existingName: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username.toLowerCase().trim());
    if (existingName) {
      return NextResponse.json({ error: 'Логин уже занят' }, { status: 400 });
    }

    // Создаем пользователя
    const hashedPassword = await bcrypt.hash(password, 10);
    db.prepare('INSERT INTO users (username, password, role, tg_id) VALUES (?, ?, ?, ?)')
      .run(username.toLowerCase().trim(), hashedPassword, 'user', telegramId);

    console.log(`[AUTH] Регистрация успешна: ${username}, TG: ${telegramId}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API-AUTH-ERROR]", error);
    return NextResponse.json({ error: error.message || 'Ошибка сервера' }, { status: 500 });
  }
}
