// Telegram conversation handler

import {
  getSubscription,
  upsertSubscription,
  unsubscribe,
} from './subscriptions';
import { getDistrictName, DISTRICTS } from '../district';
import type { Subscription } from './subscriptions';
import { fetchDHBVNOutages, DHBVNData } from '../dhbvn-api';
import * as templates from './templates';
import { getTelegramClient, sendTelegramMessage, sendTelegramKeyboard } from './client';

async function safeFetchOutages(districtId: number): Promise<DHBVNData[]> {
  try {
    return await fetchDHBVNOutages(districtId.toString());
  } catch (error) {
    console.error('Error fetching outages:', error);
    return [];
  }
}

// Parse district selection from callback data or text
function parseDistrictSelection(data: string): number | null {
  const isValidId = (id: number) => !isNaN(id) && DISTRICTS.some(d => d.id === id);

  // Check if data is callback format: "district_10"
  if (data.startsWith('district_')) {
    const districtId = parseInt(data.replace('district_', ''));
    if (isValidId(districtId)) return districtId;
  }

  // Check if message is a numeric district id
  const districtId = parseInt(data.trim());
  if (isValidId(districtId)) return districtId;

  // Check if message matches district name
  const normalizedMessage = data.trim().toLowerCase();
  const district = DISTRICTS.find(
    d => d.name.toLowerCase() === normalizedMessage
  );

  return district ? district.id : null;
}

// Handle incoming Telegram messages or callbacks
export async function handleTelegramUpdate(
  chatId: string,
  message: string,
  username?: string,
  callbackQueryId?: string
): Promise<void> {
  try {
    // Get existing subscription
    const subscription = await getSubscription(chatId);

    // If this is a callback query, acknowledge it first
    if (callbackQueryId) {
      const client = getTelegramClient();
      await client.answerCallback(callbackQueryId, 'Processing...');
    }

    // Handle commands (Telegram commands start with /)
    const isCommand = message.startsWith('/');
    const command = isCommand ? message.split('@')[0].toLowerCase() : message;

    // Command: /stop (unsubscribe)
    if (command === '/stop' || command === '/unsubscribe') {
      if (subscription) {
        await unsubscribe(chatId);
        await sendTelegramMessage(chatId, templates.getUnsubscribeMessage());
      } else {
        await sendTelegramMessage(chatId, templates.getInvalidCommandMessage());
      }
      return;
    }

    // Guard: require active subscription for /status and /change
    async function requireActiveSubscription(): Promise<Subscription | null> {
      if (!subscription || !subscription.is_active) {
        await sendTelegramMessage(chatId, 'You are not subscribed. Send /start to get started.');
        return null;
      }
      return subscription;
    }

    // Command: /status (current outages)
    if (command === '/status') {
      const activeSub = await requireActiveSubscription();
      if (!activeSub) return;

      const outages = await safeFetchOutages(activeSub.district_id);
      const statusMessage = templates.getStatusMessage(activeSub.district_name, outages);
      await sendTelegramMessage(chatId, statusMessage);
      return;
    }

    // Command: /change (update district)
    if (command === '/change') {
      if (!(await requireActiveSubscription())) return;

      await sendDistrictSelector(chatId);
      return;
    }

    // Command: /help
    if (command === '/help') {
      await sendTelegramMessage(chatId, templates.getHelpMessage());
      return;
    }

    // Check if message is a district selection (number, name, or callback data)
    const districtId = parseDistrictSelection(message);
    if (districtId !== null) {
      await handleDistrictSelection(chatId, districtId, username);
      return;
    }

    // Command: /start (or new user flow)
    if (command === '/start' || (!subscription && !isCommand)) {
      if (subscription && subscription.is_active) {
        // Already subscribed
        await sendTelegramMessage(
          chatId,
          templates.getAlreadySubscribedMessage(subscription.district_name)
        );
        return;
      }

      // Send welcome and district selector
      await sendTelegramKeyboard(
        chatId,
        templates.getWelcomeMessage(),
        templates.getDistrictKeyboard()
      );
      return;
    }

    // Default: invalid command or message
    await sendTelegramMessage(chatId, templates.getInvalidCommandMessage());

  } catch (error) {
    console.error('Error handling Telegram update:', error);
    await sendTelegramMessage(chatId, templates.getErrorMessage());
  }
}

// Send district selector (inline keyboard)
async function sendDistrictSelector(chatId: string): Promise<void> {
  const keyboard = templates.getDistrictKeyboard();
  await sendTelegramKeyboard(
    chatId,
    templates.getChangeDistrictMessage(),
    keyboard
  );
}

// Handle district selection
async function handleDistrictSelection(
  chatId: string,
  districtId: number,
  username?: string
): Promise<void> {
  // Save subscription
  await upsertSubscription(chatId, districtId, username);
  const districtName = getDistrictName(districtId);

  // Fetch current outages
  const outages = await safeFetchOutages(districtId);

  // Send confirmation with current outages
  const confirmationMessage = templates.getConfirmationMessage(districtName, outages);
  await sendTelegramMessage(chatId, confirmationMessage);
}

// Parse incoming webhook payload from Telegram
export function parseTelegramWebhook(body: any) {
  try {
    // Handle regular message
    if (body.message) {
      const message = body.message;
      return {
        chatId: message.chat.id.toString(),
        message: message.text || '',
        username: message.from?.username,
        messageType: 'message' as const
      };
    }

    // Handle callback query (button press)
    if (body.callback_query) {
      const query = body.callback_query;
      return {
        chatId: query.message.chat.id.toString(),
        message: query.data || '',
        username: query.from?.username,
        messageType: 'callback' as const,
        callbackQueryId: query.id
      };
    }

    return null;
  } catch (error) {
    console.error('Error parsing Telegram webhook:', error);
    return null;
  }
}
