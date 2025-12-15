// WhatsApp API client wrapper
// Supports both Meta Cloud API and Twilio

export type WhatsAppProvider = 'meta' | 'twilio';

interface SendMessageParams {
  to: string;
  message: string;
}

interface SendInteractiveParams {
  to: string;
  interactive: any; // Interactive message payload
}

// Meta Cloud API client
class MetaWhatsAppClient {
  private phoneNumberId: string;
  private accessToken: string;
  private apiVersion: string = 'v18.0';

  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';

    if (!this.phoneNumberId || !this.accessToken) {
      throw new Error('Meta WhatsApp credentials not configured');
    }
  }

  async sendMessage({ to, message }: SendMessageParams): Promise<boolean> {
    const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: { body: message }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Meta WhatsApp API error:', error);
      return false;
    }

    return true;
  }

  async sendInteractive({ to, interactive }: SendInteractiveParams): Promise<boolean> {
    const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'interactive',
        interactive: interactive
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Meta WhatsApp API error:', error);
      return false;
    }

    return true;
  }

  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }

    return null;
  }

  async verifySignature(payload: string, signature: string): Promise<boolean> {
    const crypto = await import('crypto');
    const appSecret = process.env.WHATSAPP_APP_SECRET || '';

    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', appSecret)
      .update(payload)
      .digest('hex');

    return signature === expectedSignature;
  }
}

// Twilio WhatsApp client
class TwilioWhatsAppClient {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || '';

    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      throw new Error('Twilio credentials not configured');
    }
  }

  async sendMessage({ to, message }: SendMessageParams): Promise<boolean> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;

    // Ensure numbers have whatsapp: prefix
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const formattedFrom = this.fromNumber.startsWith('whatsapp:')
      ? this.fromNumber
      : `whatsapp:${this.fromNumber}`;

    const params = new URLSearchParams({
      To: formattedTo,
      From: formattedFrom,
      Body: message
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Twilio API error:', error);
      return false;
    }

    return true;
  }

  async sendInteractive({ to, interactive }: SendInteractiveParams): Promise<boolean> {
    // Twilio doesn't support interactive messages in the same way
    // Fall back to text message with options
    const message = this.convertInteractiveToText(interactive);
    return this.sendMessage({ to, message });
  }

  private convertInteractiveToText(interactive: any): string {
    if (interactive.type === 'list') {
      let text = interactive.body.text + '\n\n';
      interactive.action.sections.forEach((section: any) => {
        section.rows.forEach((row: any, index: number) => {
          text += `${index + 1}. ${row.title}\n`;
        });
      });
      return text;
    }
    return interactive.body.text;
  }

  async verifySignature(payload: string, signature: string): Promise<boolean> {
    const crypto = await import('crypto');
    const url = process.env.TWILIO_WEBHOOK_URL || '';

    // Twilio uses X-Twilio-Signature header
    const expectedSignature = crypto
      .createHmac('sha1', this.authToken)
      .update(url + payload)
      .digest('base64');

    return signature === expectedSignature;
  }
}

// Factory function to get the appropriate client
export function getWhatsAppClient(): MetaWhatsAppClient | TwilioWhatsAppClient {
  const provider = (process.env.WHATSAPP_PROVIDER || 'meta') as WhatsAppProvider;

  if (provider === 'twilio') {
    return new TwilioWhatsAppClient();
  }

  return new MetaWhatsAppClient();
}

// Convenience functions
export async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
  const client = getWhatsAppClient();
  return client.sendMessage({ to, message });
}

export async function sendWhatsAppInteractive(to: string, interactive: any): Promise<boolean> {
  const client = getWhatsAppClient();
  return client.sendInteractive({ to, interactive });
}

// Message sending with retry logic
export async function sendMessageWithRetry(
  to: string,
  message: string,
  maxRetries: number = 3
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const success = await sendWhatsAppMessage(to, message);
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

// Batch message sending with rate limiting
export async function sendBatchMessages(
  recipients: Array<{ phone: string; message: string }>,
  rateLimit: number = 80 // messages per second (Meta limit)
): Promise<{ success: number; failed: number }> {
  const results = { success: 0, failed: 0 };
  const delayMs = 1000 / rateLimit;

  for (const { phone, message } of recipients) {
    const success = await sendMessageWithRetry(phone, message);

    if (success) {
      results.success++;
    } else {
      results.failed++;
    }

    // Rate limiting delay
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  return results;
}
