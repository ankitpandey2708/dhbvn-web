// Telegram message templates

import { DHBVNData } from '../database/outages';
import { DISTRICTS } from '../database/subscriptions';

// Format a single outage for display
export function formatOutage(outage: DHBVNData): string {
  return `📍 <b>${outage.area}</b> (Feeder: ${outage.feeder})
⚡ Started: ${outage.start_time}
🔧 Expected restoration: ${outage.restoration_time}
📝 Reason: ${outage.reason}`;
}

// Welcome message for new users
export function getWelcomeMessage(): string {
  return `👋 <b>Welcome to DHBVN Outage Alerts!</b>

Get instant updates about power outages in your district.

Please select your district to continue.`;
}

// Subscription confirmation message with current outages
export function getConfirmationMessage(
  districtName: string,
  outages: DHBVNData[]
): string {
  let message = `✅ <b>Subscribed to ${districtName} alerts!</b>\n\n`;

  if (outages.length > 0) {
    message += `Current outages in ${districtName}:\n\n`;
    message += outages.map((o, i) => `${i + 1}. ${formatOutage(o)}`).join('\n\n---\n\n');
    message += '\n\n';
  } else {
    message += `✨ No outages currently reported in ${districtName}.\n\n`;
  }

  message += `You'll receive automatic notifications when:
• New outages are reported
• Outages are restored

<b>Commands:</b>
/status - View current outages
/change - Update your district
/stop - Unsubscribe from alerts
/help - Show help`;

  return message;
}

// New outage alert notification
export function getNewOutageAlert(districtName: string, outages: DHBVNData[]): string {
  if (outages.length === 1) {
    return `⚠️ <b>New Outage Alert - ${districtName}</b>\n\n${formatOutage(outages[0])}`;
  }

  return `⚠️ <b>${outages.length} New Outages - ${districtName}</b>\n\n` +
    outages.map((o, i) => `${i + 1}. ${formatOutage(o)}`).join('\n\n---\n\n');
}

// Restoration notification
export function getRestorationAlert(districtName: string, area: string, feeder: string): string {
  return `✅ <b>Power Restored - ${districtName}</b>\n\n📍 ${area} (Feeder: ${feeder})\n\nPower has been restored in this area.`;
}

// Current status message
export function getStatusMessage(districtName: string, outages: DHBVNData[]): string {
  if (outages.length === 0) {
    return `✨ No outages currently reported in ${districtName}.`;
  }

  return `<b>Current outages in ${districtName}:</b>\n\n` +
    outages.map((o, i) => `${i + 1}. ${formatOutage(o)}`).join('\n\n---\n\n');
}

// Unsubscribe confirmation
export function getUnsubscribeMessage(): string {
  return `✅ You've been unsubscribed from DHBVN alerts.\n\nSend /start anytime to subscribe again.`;
}

// District change prompt
export function getChangeDistrictMessage(): string {
  return `Please select your new district:`;
}

// Help message
export function getHelpMessage(): string {
  return `📱 <b>DHBVN Outage Alerts Help</b>

<b>Available commands:</b>
/start - Subscribe to alerts
/status - View current outages
/change - Update your district
/stop - Unsubscribe from alerts
/help - Show this help message

You'll receive automatic notifications when new outages occur or when power is restored.`;
}

// Error message
export function getErrorMessage(): string {
  return `❌ Sorry, something went wrong. Please try again later or send /help for assistance.`;
}

// Invalid command message
export function getInvalidCommandMessage(): string {
  return `❓ I didn't understand that command.

Send:
/start - to get started
/status - to see current outages
/change - to update your district
/stop - to unsubscribe
/help - for more information`;
}

// District selector keyboard (inline keyboard for Telegram)
export function getDistrictKeyboard(): Array<Array<{ text: string; callback_data: string }>> {
  // Create rows of 2 buttons each
  const keyboard: Array<Array<{ text: string; callback_data: string }>> = [];

  for (let i = 0; i < DISTRICTS.length; i += 2) {
    const row = [];
    row.push({
      text: DISTRICTS[i].name,
      callback_data: `district_${DISTRICTS[i].id}`
    });

    if (i + 1 < DISTRICTS.length) {
      row.push({
        text: DISTRICTS[i + 1].name,
        callback_data: `district_${DISTRICTS[i + 1].id}`
      });
    }

    keyboard.push(row);
  }

  return keyboard;
}

// Rate limit warning
export function getRateLimitMessage(): string {
  return `⚠️ Too many messages. Please wait a moment before trying again.`;
}

// Subscription already exists message
export function getAlreadySubscribedMessage(districtName: string): string {
  return `You're already subscribed to ${districtName} alerts.\n\nSend /change to update your district or /status to see current outages.`;
}
