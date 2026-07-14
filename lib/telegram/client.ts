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


class TelegramBotClient {
  private botToken: string;
  private apiUrl: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';

    if (!this.botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  // Shared API request method to eliminate duplication between sendMessage/sendKeyboard
  private async apiPost(endpoint: string, body: Record<string, unknown>): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Telegram API error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Telegram API error (${endpoint}):`, error);
      return false;
    }
  }

  // Send simple text message
  async sendMessage({ chatId, message }: SendMessageParams): Promise<boolean> {
    const success = await this.apiPost('sendMessage', {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    });

    return success;
  }

  // Send message with inline keyboard (for district selection)
  async sendKeyboard({ chatId, message, keyboard }: SendKeyboardParams): Promise<boolean> {
    const success = await this.apiPost('sendMessage', {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard },
    });

    return success;
  }

  // Answer callback query (acknowledge button press)
  async answerCallback(callbackQueryId: string, text?: string): Promise<void> {
    await this.apiPost('answerCallbackQuery', {
      callback_query_id: callbackQueryId,
      text: text || 'Processing...'
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
