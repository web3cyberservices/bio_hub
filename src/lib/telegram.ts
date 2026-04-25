/**
 * @fileOverview Сервис для работы с Telegram Bot API.
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function sendTelegramNotification(chatId: string, text: string) {
  if (!BOT_TOKEN || !chatId) return null;

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Telegram Notification Error:", error);
    return null;
  }
}