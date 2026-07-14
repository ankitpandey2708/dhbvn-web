// Telegram message templates

import { DHBVNData } from '../dhbvn-api';
import { DISTRICTS } from '../district';

// Shared command list (used across multiple templates)
const COMMANDS = `/status - View current outages
/change - Update your district
/stop - Unsubscribe from alerts
/help - Show this help message`;

// Format a single outage for display
function formatOutage(outage: DHBVNData): string {
  return `⚡ <b>${outage.feeder}</b>
📍 Areas: ${outage.areas.join(', ')}
🕐 Started: ${outage.start_time}
🔧 Expected restoration: ${outage.restoration_time}
📝 Reason: ${outage.reason}`;
}

// Format a list of outages (shared by confirmation and status messages)
function formatOutageList(outages: DHBVNData[]): string {
  return outages.map((o, i) => `${i + 1}. ${formatOutage(o)}`).join('\n\n---\n\n');
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
    message += formatOutageList(outages);
    message += '\n\n';
  } else {
    message += `✨ No outages currently reported in ${districtName}.\n\n`;
  }

  message += `<b>Commands:</b>\n${COMMANDS}`;

  return message;
}



// Current status message
export function getStatusMessage(districtName: string, outages: DHBVNData[]): string {
  if (outages.length === 0) {
    return `✨ No outages currently reported in ${districtName}.`;
  }

  return `<b>Current outages in ${districtName}:</b>\n\n` + formatOutageList(outages);
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
  return `📱 <b>DHBVN Outage Alerts Help</b>\n\n<b>Available commands:</b>\n/start - Subscribe to alerts\n${COMMANDS}`;
}


// Error message
export function getErrorMessage(): string {
  return `❌ Sorry, something went wrong.Please try again later or send / help for assistance.`;
}


// Invalid command message
export function getInvalidCommandMessage(): string {
  return `❓ I didn't understand that command.\n\nSend:\n/start - to get started\n${COMMANDS}`;
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



// Subscription already exists message
export function getAlreadySubscribedMessage(districtName: string): string {
  return `You're already subscribed to ${districtName} alerts.\n\nSend /change to update your district or /status to see current outages.`;
}
