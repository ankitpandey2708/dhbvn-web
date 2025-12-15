// Telegram conversation handler

import {
  getSubscription,
  upsertSubscription,
  unsubscribe,
  getDistrictName,
  DISTRICTS,
} from '../database/subscriptions';
import { fetchDHBVNOutages, DHBVNData } from '../dhbvn-api';
import * as templates from './telegram-templates';
import { getTelegramClient, sendTelegramMessage, sendTelegramKeyboard } from './telegram-client';
import { logTelegramEvent } from '../database/logs';

// Fetch current outages from the API
async function fetchCurrentOutages(districtId: number): Promise<DHBVNData[]> {
  try {
    return await fetchDHBVNOutages(districtId.toString());
  } catch (error) {
    console.error('Error fetching outages:', error);
    return [];
  }
}

// Parse district selection from callback data or text
function parseDistrictSelection(data: string): number | null {
  // Check if data is callback format: "district_10"
  if (data.startsWith('district_')) {
    const districtId = parseInt(data.replace('district_', ''));
    if (!isNaN(districtId) && districtId >= 1 && districtId <= 12) {
      return districtId;
    }
  }

  // Check if message is a number (1-12)
  const districtId = parseInt(data.trim());
  if (!isNaN(districtId) && districtId >= 1 && districtId <= 12) {
    return districtId;
  }

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

    // Command: /status (current outages)
    if (command === '/status') {
      if (!subscription || !subscription.is_active) {
        await sendTelegramMessage(
          chatId,
          'You are not subscribed. Send /start to get started.'
        );
        return;
      }

      const outages = await fetchCurrentOutages(subscription.district_id);
      const statusMessage = templates.getStatusMessage(subscription.district_name, outages);
      await sendTelegramMessage(chatId, statusMessage);
      return;
    }

    // Command: /change (update district)
    if (command === '/change') {
      if (!subscription || !subscription.is_active) {
        await sendTelegramMessage(
          chatId,
          'You are not subscribed. Send /start to get started.'
        );
        return;
      }

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
    await logTelegramEvent({
      type: 'error',
      chatId: chatId,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      payload: { context: 'handleTelegramUpdate', command: message }
    });
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
  const outages = await fetchCurrentOutages(districtId);

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
