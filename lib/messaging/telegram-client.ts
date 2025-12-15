// Telegram Bot API client
// 100% free, no per-message costs!

interface SendMessageParams {
  chatId: string;
  message: string;
}

interface SendKeyboardParams {
  chatId: string;
  message: string;
  keyboard: Array<Array<{ text: string; callback_data: string }>>;
}

export class TelegramBotClient {
  private botToken: string;
  private apiUrl: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';

    if (!this.botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  // Send simple text message
  async sendMessage({ chatId, message }: SendMessageParams): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML', // Allows basic formatting
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Telegram API error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      return false;
    }
  }

  // Send message with inline keyboard (for district selection)
  async sendKeyboard({ chatId, message, keyboard }: SendKeyboardParams): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: keyboard
          }
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Telegram API error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending Telegram keyboard:', error);
      return false;
    }
  }

  // Answer callback query (acknowledge button press)
  async answerCallback(callbackQueryId: string, text?: string): Promise<void> {
    await fetch(`${this.apiUrl}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text || 'Processing...'
      })
    });
  }

  // Set webhook URL
  async setWebhook(webhookUrl: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message', 'callback_query']
        })
      });

      const result = await response.json();
      return result.ok;
    } catch (error) {
      console.error('Error setting webhook:', error);
      return false;
    }
  }

  // Get webhook info (for debugging)
  async getWebhookInfo(): Promise<any> {
    const response = await fetch(`${this.apiUrl}/getWebhookInfo`);
    return response.json();
  }
}

// Singleton instance
let client: TelegramBotClient | null = null;

export function getTelegramClient(): TelegramBotClient {
  if (!client) {
    client = new TelegramBotClient();
  }
  return client;
}

// Convenience functions
export async function sendTelegramMessage(chatId: string, message: string): Promise<boolean> {
  const client = getTelegramClient();
  return client.sendMessage({ chatId, message });
}

export async function sendTelegramKeyboard(
  chatId: string,
  message: string,
  keyboard: Array<Array<{ text: string; callback_data: string }>>
): Promise<boolean> {
  const client = getTelegramClient();
  return client.sendKeyboard({ chatId, message, keyboard });
}

// Message sending with retry logic
export async function sendMessageWithRetry(
  chatId: string,
  message: string,
  maxRetries: number = 3
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const success = await sendTelegramMessage(chatId, message);
      if (success) return true;

      // Exponential backoff
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    } catch (error) {
      console.error(`Send attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        return false;
      }
    }
  }

  return false;
}

// Batch message sending (no rate limits on Telegram!)
export async function sendBatchMessages(
  recipients: Array<{ chatId: string; message: string }>
): Promise<{ success: number; failed: number }> {
  const results = { success: 0, failed: 0 };

  // Telegram can handle high throughput, but let's be reasonable
  const batchSize = 30;

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async ({ chatId, message }) => {
        const success = await sendMessageWithRetry(chatId, message);
        if (success) {
          results.success++;
        } else {
          results.failed++;
        }
      })
    );

    // Small delay between batches to be nice to Telegram's API
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}
