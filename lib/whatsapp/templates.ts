// WhatsApp message templates

import { DHBVNData } from '../database/outages';
import { DISTRICTS } from '../database/subscriptions';

// Format a single outage for display
export function formatOutage(outage: DHBVNData): string {
  return `📍 ${outage.area} (Feeder: ${outage.feeder})
⚡ Started: ${outage.start_time}
🔧 Expected restoration: ${outage.restoration_time}
📝 Reason: ${outage.reason}`;
}

// Welcome message for new users
export function getWelcomeMessage(): string {
  return `👋 Welcome to DHBVN Outage Alerts!

Get instant updates about power outages in your district.

Please select your district to continue.`;
}

// Subscription confirmation message with current outages
export function getConfirmationMessage(
  districtName: string,
  outages: DHBVNData[]
): string {
  let message = `✅ Subscribed to ${districtName} alerts!\n\n`;

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

Commands:
• CHANGE - Update your district
• STOP - Unsubscribe from alerts
• STATUS - View current outages`;

  return message;
}

// New outage alert notification
export function getNewOutageAlert(districtName: string, outages: DHBVNData[]): string {
  if (outages.length === 1) {
    return `⚠️ New Outage Alert - ${districtName}\n\n${formatOutage(outages[0])}`;
  }

  return `⚠️ ${outages.length} New Outages - ${districtName}\n\n` +
    outages.map((o, i) => `${i + 1}. ${formatOutage(o)}`).join('\n\n---\n\n');
}

// Restoration notification
export function getRestorationAlert(districtName: string, area: string, feeder: string): string {
  return `✅ Power Restored - ${districtName}\n\n📍 ${area} (Feeder: ${feeder})\n\nPower has been restored in this area.`;
}

// Current status message
export function getStatusMessage(districtName: string, outages: DHBVNData[]): string {
  if (outages.length === 0) {
    return `✨ No outages currently reported in ${districtName}.`;
  }

  return `Current outages in ${districtName}:\n\n` +
    outages.map((o, i) => `${i + 1}. ${formatOutage(o)}`).join('\n\n---\n\n');
}

// Unsubscribe confirmation
export function getUnsubscribeMessage(): string {
  return `✅ You've been unsubscribed from DHBVN alerts.\n\nSend HI anytime to subscribe again.`;
}

// District change prompt
export function getChangeDistrictMessage(): string {
  return `Please select your new district:`;
}

// Help message
export function getHelpMessage(): string {
  return `📱 DHBVN Outage Alerts Help

Available commands:
• HI - Subscribe to alerts
• STATUS - View current outages
• CHANGE - Update your district
• STOP - Unsubscribe from alerts

You'll receive automatic notifications when new outages occur or when power is restored.`;
}

// Error message
export function getErrorMessage(): string {
  return `❌ Sorry, something went wrong. Please try again later or send HELP for assistance.`;
}

// Invalid command message
export function getInvalidCommandMessage(): string {
  return `❓ I didn't understand that command.

Send:
• HI - to get started
• STATUS - to see current outages
• CHANGE - to update your district
• STOP - to unsubscribe
• HELP - for more information`;
}

// District selector interactive list (for WhatsApp API)
export function getDistrictListPayload() {
  return {
    type: 'list',
    header: {
      type: 'text',
      text: 'Select Your District'
    },
    body: {
      text: 'Choose the district where you want to receive power outage alerts:'
    },
    footer: {
      text: 'DHBVN Outage Alerts'
    },
    action: {
      button: 'Select District',
      sections: [
        {
          title: 'Haryana Districts',
          rows: DISTRICTS.map(d => ({
            id: `district_${d.id}`,
            title: d.name,
            description: `Get alerts for ${d.name}`
          }))
        }
      ]
    }
  };
}

// District selector as buttons (for platforms with limited interactive support)
export function getDistrictButtons() {
  return {
    type: 'button',
    body: {
      text: 'Select your district:'
    },
    action: {
      buttons: DISTRICTS.slice(0, 3).map(d => ({
        type: 'reply',
        reply: {
          id: `district_${d.id}`,
          title: d.name
        }
      }))
    }
  };
}

// Format district options as text (fallback for basic text messages)
export function getDistrictOptionsText(): string {
  return `Please select your district by sending the district number:\n\n` +
    DISTRICTS.map(d => `${d.id}. ${d.name}`).join('\n') +
    '\n\nExample: Send "10" for Faridabad';
}

// Rate limit warning
export function getRateLimitMessage(): string {
  return `⚠️ Too many messages. Please wait a moment before trying again.`;
}

// Subscription already exists message
export function getAlreadySubscribedMessage(districtName: string): string {
  return `You're already subscribed to ${districtName} alerts.\n\nSend CHANGE to update your district or STATUS to see current outages.`;
}
