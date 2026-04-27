'use server';

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * @fileOverview Серверные действия для отправки уведомлений.
 */

if (!getApps().length) {
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'webcybersecurity',
  });
}

const db = getFirestore();

export async function sendAppNotification({
  userId,
  title,
  message,
  type
}: {
  userId: string;
  title: string;
  message: string;
  type: 'message' | 'appointment';
}) {
  try {
    // 1. Получаем данные пользователя из Firestore (серверная часть)
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.telegramChatId) {
      console.log(`[NOTIFY] User ${userId} has no Telegram linked.`);
      return { success: false, reason: 'no_telegram' };
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN is not set');

    const icon = type === 'message' ? '💬' : '📅';
    const tgMessage = `<b>${icon} ${title}</b>\n\n${message}\n\n<a href="https://t.me/web3cyberservices_bot/app">Открыть Bio-Hub</a>`;

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: userData.telegramChatId,
        text: tgMessage,
        parse_mode: 'HTML',
      }),
    });

    return { success: response.ok };
  } catch (error) {
    console.error('[NOTIFY_ERROR]', error);
    return { success: false, error };
  }
}
