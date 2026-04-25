import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * @fileOverview Webhook для Telegram-бота @web3cyberservices_bot.
 * Обрабатывает привязку UID приложения к Chat ID Telegram через команду /start.
 */

if (!getApps().length) {
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'webcybersecurity',
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

    // Команда /start [UID]
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      
      if (parts.length > 1) {
        const uid = parts[1];
        
        // Поиск и обновление профиля в Firestore
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          await userRef.update({
            telegramChatId: chatId,
            updatedAt: new Date().toISOString(),
          });

          await sendRawTGMessage(chatId, 
            `<b>Успешная синхронизация!</b>\n\n🚀 Ваш аккаунт <b>PRO Себя</b> успешно привязан.\n\nТеперь я буду присылать сюда:\n• Уведомления о новых анализах\n• Подтверждения записей к специалистам\n• Ежедневные ИИ-инсайты по здоровью.`
          );
        } else {
          await sendRawTGMessage(chatId, `❌ <b>Ошибка:</b> Пользователь с таким ID не найден. Вернитесь в приложение и попробуйте нажать кнопку привязки снова.`);
        }
      } else {
        await sendRawTGMessage(chatId, `Добро пожавать в <b>PRO Себя</b>!\n\nЧтобы я мог присылать вам уведомления, используйте кнопку "Подключить" в настройках профиля внутри нашего приложения.`);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram Webhook Error:", error);
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
