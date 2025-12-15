// WhatsApp conversation handler

import {
  getSubscription,
  upsertSubscription,
  unsubscribe,
  getDistrictName,
  DISTRICTS,
} from '../database/subscriptions';
import { getActiveOutages, DHBVNData } from '../database/outages';
import * as templates from './templates';
import { sendWhatsAppMessage, sendWhatsAppInteractive } from './client';

// Fetch current outages from the API
async function fetchCurrentOutages(districtId: number): Promise<DHBVNData[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/dhbvn?district=${districtId}`);

    if (!response.ok) {
      console.error('Failed to fetch outages:', response.statusText);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching outages:', error);
    return [];
  }
}

// Parse district selection from message
function parseDistrictSelection(message: string): number | null {
  // Check if message is a number (1-12)
  const districtId = parseInt(message.trim());
  if (!isNaN(districtId) && districtId >= 1 && districtId <= 12) {
    return districtId;
  }

  // Check if message matches district name
  const normalizedMessage = message.trim().toLowerCase();
  const district = DISTRICTS.find(
    d => d.name.toLowerCase() === normalizedMessage
  );

  return district ? district.id : null;
}

// Handle incoming WhatsApp messages
export async function handleIncomingMessage(
  from: string,
  message: string,
  messageType: 'text' | 'interactive' = 'text',
  interactiveResponse?: any
): Promise<void> {
  try {
    // Normalize phone number (remove whatsapp: prefix if present)
    const phoneNumber = from.replace('whatsapp:', '');
    const normalizedMessage = message.trim().toUpperCase();

    // Get existing subscription
    const subscription = await getSubscription(phoneNumber);

    // Handle interactive list response
    if (messageType === 'interactive' && interactiveResponse) {
      await handleDistrictSelection(phoneNumber, interactiveResponse.list_reply.id);
      return;
    }

    // Command: STOP (unsubscribe)
    if (normalizedMessage === 'STOP' || normalizedMessage === 'UNSUBSCRIBE') {
      if (subscription) {
        await unsubscribe(phoneNumber);
        await sendWhatsAppMessage(phoneNumber, templates.getUnsubscribeMessage());
      } else {
        await sendWhatsAppMessage(phoneNumber, templates.getInvalidCommandMessage());
      }
      return;
    }

    // Command: STATUS (current outages)
    if (normalizedMessage === 'STATUS') {
      if (!subscription || !subscription.is_active) {
        await sendWhatsAppMessage(
          phoneNumber,
          'You are not subscribed. Send HI to get started.'
        );
        return;
      }

      const outages = await fetchCurrentOutages(subscription.district_id);
      const statusMessage = templates.getStatusMessage(subscription.district_name, outages);
      await sendWhatsAppMessage(phoneNumber, statusMessage);
      return;
    }

    // Command: CHANGE (update district)
    if (normalizedMessage === 'CHANGE') {
      if (!subscription || !subscription.is_active) {
        await sendWhatsAppMessage(
          phoneNumber,
          'You are not subscribed. Send HI to get started.'
        );
        return;
      }

      await sendDistrictSelector(phoneNumber);
      return;
    }

    // Command: HELP
    if (normalizedMessage === 'HELP') {
      await sendWhatsAppMessage(phoneNumber, templates.getHelpMessage());
      return;
    }

    // New user or resubscribe flow
    if (normalizedMessage === 'HI' || normalizedMessage === 'HELLO' || normalizedMessage === 'START') {
      if (subscription && subscription.is_active) {
        // Already subscribed
        await sendWhatsAppMessage(
          phoneNumber,
          templates.getAlreadySubscribedMessage(subscription.district_name)
        );
        return;
      }

      // Send welcome and district selector
      await sendWhatsAppMessage(phoneNumber, templates.getWelcomeMessage());
      await sendDistrictSelector(phoneNumber);
      return;
    }

    // Check if message is a district selection
    const districtId = parseDistrictSelection(message);
    if (districtId !== null) {
      await handleDistrictSelection(phoneNumber, `district_${districtId}`);
      return;
    }

    // Default: invalid command
    await sendWhatsAppMessage(phoneNumber, templates.getInvalidCommandMessage());

  } catch (error) {
    console.error('Error handling message:', error);
    await sendWhatsAppMessage(from, templates.getErrorMessage());
  }
}

// Send district selector (interactive list or text)
async function sendDistrictSelector(phoneNumber: string): Promise<void> {
  const provider = process.env.WHATSAPP_PROVIDER || 'meta';

  if (provider === 'meta') {
    // Use interactive list for Meta Cloud API
    const listPayload = templates.getDistrictListPayload();
    await sendWhatsAppInteractive(phoneNumber, listPayload);
  } else {
    // Use text-based selection for Twilio
    const textOptions = templates.getDistrictOptionsText();
    await sendWhatsAppMessage(phoneNumber, textOptions);
  }
}

// Handle district selection
async function handleDistrictSelection(phoneNumber: string, selectionId: string): Promise<void> {
  // Parse district ID from selection (format: "district_10")
  const districtId = parseInt(selectionId.replace('district_', ''));

  if (isNaN(districtId) || districtId < 1 || districtId > 12) {
    await sendWhatsAppMessage(
      phoneNumber,
      'Invalid district selection. Please try again.'
    );
    await sendDistrictSelector(phoneNumber);
    return;
  }

  // Save subscription
  await upsertSubscription(phoneNumber, districtId);
  const districtName = getDistrictName(districtId);

  // Fetch current outages
  const outages = await fetchCurrentOutages(districtId);

  // Send confirmation with current outages
  const confirmationMessage = templates.getConfirmationMessage(districtName, outages);
  await sendWhatsAppMessage(phoneNumber, confirmationMessage);
}

// Parse incoming webhook payload
export function parseWebhookPayload(body: any, provider: WhatsAppProvider = 'meta') {
  if (provider === 'meta') {
    return parseMetaWebhook(body);
  } else {
    return parseTwilioWebhook(body);
  }
}

// Parse Meta Cloud API webhook
function parseMetaWebhook(body: any) {
  try {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) return null;

    const from = message.from;
    const messageType = message.type;

    let text = '';
    let interactive = null;

    if (messageType === 'text') {
      text = message.text?.body || '';
    } else if (messageType === 'interactive') {
      interactive = message.interactive;
      text = interactive?.list_reply?.title || interactive?.button_reply?.title || '';
    }

    return {
      from,
      message: text,
      messageType,
      interactive
    };
  } catch (error) {
    console.error('Error parsing Meta webhook:', error);
    return null;
  }
}

// Parse Twilio webhook
function parseTwilioWebhook(body: any) {
  try {
    return {
      from: body.From?.replace('whatsapp:', '') || '',
      message: body.Body || '',
      messageType: 'text' as const,
      interactive: null
    };
  } catch (error) {
    console.error('Error parsing Twilio webhook:', error);
    return null;
  }
}

export type WhatsAppProvider = 'meta' | 'twilio';
