
/**
 * @fileOverview Сервис для работы с Telegram Bot API.
 * Позволяет отправлять уведомления пользователям PRO Себя.
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * Отправляет сообщение пользователю в Telegram.
 * @param chatId ID чата пользователя (сохраняется в профиле Firestore)
 * @param text Текст сообщения (поддерживает HTML-разметку)
 */
export async function sendTelegramNotification(chatId: string, text: string) {
  if (!BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN is not defined in .env");
    return;
  }

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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.description || "Failed to send Telegram message");
    }

    return await response.json();
  } catch (error) {
    console.error("Telegram Notification Error:", error);
    return null;
  }
}
