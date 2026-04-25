import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * @fileOverview Webhook для Telegram-бота @web3cyberservices_bot.
 * Обрабатывает привязку UID приложения к Chat ID Telegram.
 */

// Инициализация Admin SDK (используйте переменные окружения для ключей в продакшене)
if (!getApps().length) {
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message;

    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id.toString();
    const text = message.text;

    // Обработка команды /start [firebase_uid]
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      
      if (parts.length > 1) {
        const uid = parts[1];
        
        // Обновляем профиль пользователя в Firestore
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          await userRef.update({
            telegramChatId: chatId,
            updatedAt: new Date().toISOString(),
          });

          await sendRawTGMessage(chatId, `<b>Успешно!</b>\n\nВаш аккаунт Bio-Tech Hub успешно привязан. Теперь вы будете получать важные уведомления о здоровье, анализах и записях к специалистам здесь.`);
        } else {
          await sendRawTGMessage(chatId, `Ошибка: Пользователь с таким ID не найден. Пожалуйста, перейдите в профиль приложения и нажмите "Подключить Telegram" снова.`);
        }
      } else {
        await sendRawTGMessage(chatId, `Добро пожаловать в <b>PRO Себя</b>!\n\nДля активации уведомлений, пожалуйста, используйте кнопку "Подключить" в настройках вашего профиля внутри приложения.`);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

async function sendRawTGMessage(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
    }),
  });
}
