import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * @fileOverview Webhook для Telegram-бота @web3cyberservices_bot.
 * Обрабатывает:
 * 1. Привязку аккаунта (/start [UID])
 * 2. Глубокие ссылки на специалистов (/start spec_[ID])
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
    
    // Определяем базовый URL приложения для кнопок
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('host');
    const baseUrl = `${protocol}://${host}`;

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
              `<b>Карточка специалиста</b>\n\n👤 <b>${data?.firstName} ${data?.lastName || ''}</b>\n🧬 Специализация: ${data?.specialization || 'Эксперт BioTech'}\n\nВы можете просмотреть полный профиль, публикации и записаться на прием по кнопке ниже:`,
              [
                [{ text: "🧬 Открыть профиль в приложении", url: `${baseUrl}/specialist/${specId}` }]
              ]
            );
          } else {
            await sendRawTGMessage(chatId, `❌ <b>Ошибка:</b> Специалист не найден в базе Bio-хаба.`);
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
              `<b>Успешная синхронизация!</b>\n\n🚀 Ваш аккаунт <b>PRO Себя</b> успешно привязан.\n\nТеперь я буду присылать сюда:\n• Уведомления о новых анализах\n• Подтверждения записей\n• Ежедневные ИИ-инсайты.`,
              [
                [{ text: "📊 Мой Дашборд", url: `${baseUrl}/dashboard` }]
              ]
            );
          } else {
            await sendRawTGMessage(chatId, `❌ <b>Ошибка:</b> Пользователь с таким ID не найден.`);
          }
        }
      } else {
        await sendRawTGMessage(chatId, `Добро пожаловать в <b>PRO Себя</b>!\n\nИспользуйте приложение для глубокого анализа вашего здоровья и связи с лучшими экспертами.`, [
          [{ text: "🚀 Зайти в Bio-хаб", url: baseUrl }]
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