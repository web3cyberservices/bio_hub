import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * @fileOverview Webhook для Telegram-бота @web3cyberservices_bot.
 * Обновлено: теперь кнопки ведут на Direct Link Mini App.
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
    const botUsername = 'web3cyberservices_bot';
    const appName = 'app'; // Название Mini App в BotFather

    // Команда /start
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      
      if (parts.length > 1) {
        const param = parts[1];
        
        // Сценарий 1: Ссылка на профиль специалиста (spec_ID)
        if (param.startsWith('spec_')) {
          const specId = param.replace('spec_', '');
          const specRef = db.collection('users').doc(specId);
          const specDoc = await specRef.get();

          if (specDoc.exists) {
            const data = specDoc.data();
            await sendRawTGMessage(chatId, 
              `<b>Карточка специалиста</b>\n\n👤 <b>${data?.firstName} ${data?.lastName || ''}</b>\n🧬 Специализация: ${data?.specialization || 'Эксперт BioTech'}\n\nНажмите кнопку ниже, чтобы открыть профиль прямо в Telegram:`,
              [
                [{ text: "🧬 Открыть профиль", url: `https://t.me/${botUsername}/${appName}?startapp=${specId}` }]
              ]
            );
          } else {
            await sendRawTGMessage(chatId, `❌ <b>Ошибка:</b> Специалист не найден.`);
          }
        } 
        // Сценарий 2: Привязка UID пользователя
        else {
          const uid = param;
          const userRef = db.collection('users').doc(uid);
          const userDoc = await userRef.get();

          if (userDoc.exists) {
            await userRef.update({
              telegramChatId: chatId,
              updatedAt: new Date().toISOString(),
            });

            await sendRawTGMessage(chatId, 
              `<b>Успешная синхронизация!</b>\n\n🚀 Ваш аккаунт успешно привязан.\n\nТеперь вы можете перейти в свой дашборд:`,
              [
                [{ text: "📊 Мой Дашборд", url: `https://t.me/${botUsername}/${appName}` }]
              ]
            );
          } else {
            await sendRawTGMessage(chatId, `❌ <b>Ошибка:</b> Пользователь не найден.`);
          }
        }
      } else {
        await sendRawTGMessage(chatId, `Добро пожаловать в <b>PRO Себя</b>!\n\nИспользуйте Mini App для глубокого анализа вашего здоровья:`, [
          [{ text: "🚀 Запустить приложение", url: `https://t.me/${botUsername}/${appName}` }]
        ]);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram Webhook Error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

async function sendRawTGMessage(chatId: string, text: string, keyboard?: any[][]) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const body: any = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
  };

  if (keyboard) {
    body.reply_markup = {
      inline_keyboard: keyboard
    };
  }

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
