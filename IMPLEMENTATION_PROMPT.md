# One-Shot Implementation Prompt: Telegram Bot for DHBVN Power Outage Notifications

Copy and paste this entire prompt to an LLM (like Claude) to implement the complete Telegram bot system.

---

## 🎯 PROJECT OVERVIEW

I need you to implement a **Telegram bot** for a Next.js application that sends real-time power outage notifications to users in Haryana, India.

### Current State:
- **Existing Next.js app** deployed on Vercel at: `https://dhbvn.vercel.app`
- **Existing API endpoint**: `GET /api/dhbvn?district=<1-12>` returns power outage data as JSON
- **Response format**:
```typescript
interface DHBVNData {
  area: string;           // e.g., "Sector 16"
  feeder: string;         // e.g., "67aa"
  start_time: string;     // e.g., "16-Apr-2025 10:24:00"
  restoration_time: string;
  reason: string;
}
```

- **12 Districts**: Jind (1), Fatehabad (2), Sirsa (3), Hisar (4), Bhiwani (5), Mahendargarh (6), Rewari (7), Gurugram (8), Nuh (9), Faridabad (10), Palwal (11), Charkhi Dadri (12)

### Requirements:
1. **Telegram bot** that users can subscribe to for outage alerts
2. **District-based subscriptions** - users pick one district
3. **Real-time notifications** - sent every 15 minutes when outages change
4. **Interactive UI** - inline keyboard buttons for district selection
5. **Commands**: /start, /status, /change, /stop, /help
6. **Smart notifications** - only send when NEW outages occur or are RESTORED

---

## 🏗️ TECHNICAL ARCHITECTURE

### Stack:
- **Framework**: Next.js 16 (App Router)
- **Database**: Vercel Postgres (with @vercel/postgres package)
- **Messaging**: Telegram Bot API (100% free, no libraries needed)
- **Scheduler**: Vercel Cron Jobs
- **Deployment**: Vercel

### Key Files to Create/Modify:
```
lib/database/
  ├── schema.sql                    # Database schema
  └── subscriptions.ts              # Subscription CRUD operations

lib/messaging/
  ├── telegram-client.ts            # Telegram API wrapper
  ├── telegram-handler.ts           # Message handling logic
  └── telegram-templates.ts         # Message templates

app/api/telegram/webhook/
  └── route.ts                      # Webhook endpoint

app/api/cron/check-outages/
  └── route.ts                      # Scheduled notification checker

.env.example                        # Environment variables template
vercel.json                         # Cron job configuration
```

---

## 📊 DATABASE SCHEMA

Create `lib/database/schema.sql`:

```sql
-- User subscriptions
CREATE TABLE IF NOT EXISTS telegram_subscriptions (
  id SERIAL PRIMARY KEY,
  chat_id VARCHAR(50) UNIQUE NOT NULL,
  username VARCHAR(100),
  district_id INTEGER NOT NULL CHECK (district_id BETWEEN 1 AND 12),
  district_name VARCHAR(50) NOT NULL,
  subscribed_at TIMESTAMP DEFAULT NOW(),
  last_notification_sent TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Outage snapshots for change detection
CREATE TABLE IF NOT EXISTS outage_snapshots (
  id SERIAL PRIMARY KEY,
  district_id INTEGER NOT NULL CHECK (district_id BETWEEN 1 AND 12),
  outage_hash VARCHAR(64) NOT NULL,
  area VARCHAR(255) NOT NULL,
  feeder VARCHAR(100) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  restoration_time TIMESTAMP NOT NULL,
  reason TEXT,
  first_seen TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW(),
  is_resolved BOOLEAN DEFAULT false,
  UNIQUE(district_id, outage_hash)
);

-- Indexes
CREATE INDEX idx_active_subscriptions ON telegram_subscriptions(is_active, district_id);
CREATE INDEX idx_chat_lookup ON telegram_subscriptions(chat_id);
CREATE INDEX idx_district_active ON outage_snapshots(district_id, is_resolved);
CREATE INDEX idx_outage_hash ON outage_snapshots(outage_hash);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_telegram_subscriptions_updated_at
  BEFORE UPDATE ON telegram_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 💬 USER FLOW

```
User: /start
Bot: Welcome message + inline keyboard with 12 district buttons

User: [Clicks "Faridabad" button]
Bot: ✅ Subscribed! Here are current outages in Faridabad:
     [Lists outages if any]
     Commands: /status, /change, /stop

--- 15 minutes later, cron job detects new outage ---
Bot: ⚠️ New Outage Alert - Faridabad
     📍 Sector 15 (Feeder: ab412)
     ⚡ Started: 16-Apr-2025 13:24
     🔧 Expected restoration: 17-Apr-2025 09:44

User: /status
Bot: [Shows current outages]

User: /change
Bot: [Shows district keyboard again]

User: /stop
Bot: ✅ Unsubscribed
```

---

## 🔧 IMPLEMENTATION DETAILS

### 1. Telegram Client (`lib/messaging/telegram-client.ts`)

Create a simple Telegram Bot API wrapper:

```typescript
export class TelegramBotClient {
  private botToken: string;
  private apiUrl: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  // Send text message
  async sendMessage(chatId: string, text: string): Promise<boolean> {
    const response = await fetch(`${this.apiUrl}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });
    return response.ok;
  }

  // Send message with inline keyboard
  async sendKeyboard(
    chatId: string,
    text: string,
    keyboard: Array<Array<{text: string, callback_data: string}>>
  ): Promise<boolean> {
    const response = await fetch(`${this.apiUrl}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard }
      })
    });
    return response.ok;
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
}
```

**Key functions:**
- `sendMessage()` - Send plain text with HTML formatting
- `sendKeyboard()` - Send message with inline buttons
- `answerCallback()` - Acknowledge button clicks
- Use singleton pattern: `export function getTelegramClient()`

### 2. Message Handler (`lib/messaging/telegram-handler.ts`)

Implement conversation logic:

```typescript
export async function handleTelegramUpdate(
  chatId: string,
  message: string,
  username?: string,
  callbackQueryId?: string
): Promise<void> {
  const subscription = await getSubscription(chatId);

  // Acknowledge callback if present
  if (callbackQueryId) {
    const client = getTelegramClient();
    await client.answerCallback(callbackQueryId);
  }

  // Handle commands
  if (message === '/start') {
    // Send welcome + district selector
  }
  else if (message === '/status') {
    // Fetch and show current outages for user's district
  }
  else if (message === '/change') {
    // Show district selector again
  }
  else if (message === '/stop') {
    // Unsubscribe user
  }
  else if (message.startsWith('district_')) {
    // Handle district selection from callback
    const districtId = parseInt(message.replace('district_', ''));
    await upsertSubscription(chatId, districtId, username);
    // Fetch and show current outages
  }
}
```

**Parse webhook payload:**
```typescript
export function parseTelegramWebhook(body: any) {
  if (body.message) {
    return {
      chatId: body.message.chat.id.toString(),
      message: body.message.text || '',
      username: body.message.from?.username,
      messageType: 'message'
    };
  }
  if (body.callback_query) {
    return {
      chatId: body.callback_query.message.chat.id.toString(),
      message: body.callback_query.data || '',
      username: body.callback_query.from?.username,
      messageType: 'callback',
      callbackQueryId: body.callback_query.id
    };
  }
  return null;
}
```

### 3. Message Templates (`lib/messaging/telegram-templates.ts`)

Create HTML-formatted message templates:

```typescript
export function formatOutage(outage: DHBVNData): string {
  return `📍 <b>${outage.area}</b> (Feeder: ${outage.feeder})
⚡ Started: ${outage.start_time}
🔧 Expected restoration: ${outage.restoration_time}
📝 Reason: ${outage.reason}`;
}

export function getWelcomeMessage(): string {
  return `👋 <b>Welcome to DHBVN Outage Alerts!</b>

Get instant updates about power outages in your district.

Please select your district to continue.`;
}

export function getDistrictKeyboard(): Array<Array<{text: string, callback_data: string}>> {
  const districts = [
    {id: 1, name: 'Jind'}, {id: 2, name: 'Fatehabad'},
    // ... all 12 districts
  ];

  // Create rows of 2 buttons each
  const keyboard = [];
  for (let i = 0; i < districts.length; i += 2) {
    keyboard.push([
      {text: districts[i].name, callback_data: `district_${districts[i].id}`},
      {text: districts[i+1]?.name, callback_data: `district_${districts[i+1]?.id}`}
    ].filter(Boolean));
  }
  return keyboard;
}

export function getNewOutageAlert(districtName: string, outages: DHBVNData[]): string {
  return `⚠️ <b>New Outage Alert - ${districtName}</b>\n\n` +
    outages.map(o => formatOutage(o)).join('\n\n---\n\n');
}
```

### 4. Webhook Endpoint (`app/api/telegram/webhook/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { handleTelegramUpdate, parseTelegramWebhook } from '@/lib/messaging/telegram-handler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = parseTelegramWebhook(body);

    if (!parsed) {
      return NextResponse.json({ ok: true });
    }

    const { chatId, message, username, callbackQueryId } = parsed;

    // Handle asynchronously
    handleTelegramUpdate(chatId, message, username, callbackQueryId).catch(console.error);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ ok: true });
  }
}

export const dynamic = 'force-dynamic';
```

### 5. Notification Scheduler (`app/api/cron/check-outages/route.ts`)

```typescript
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const activeDistricts = await getActiveDistricts();

  for (const districtId of activeDistricts) {
    // 1. Fetch current outages from API
    const response = await fetch(`${baseUrl}/api/dhbvn?district=${districtId}`);
    const currentOutages = await response.json();

    // 2. Detect changes (compare with database snapshots)
    const changes = await detectOutageChanges(districtId, currentOutages);

    // 3. Get subscribers for this district
    const subscribers = await getSubscriptionsByDistrict(districtId);

    // 4. Send notifications for NEW outages
    if (changes.new.length > 0) {
      const message = getNewOutageAlert(districtName, changes.new);
      for (const sub of subscribers) {
        await sendTelegramMessage(sub.chat_id, message);
      }
    }

    // 5. Send notifications for RESOLVED outages
    if (changes.resolved.length > 0) {
      for (const resolved of changes.resolved) {
        const message = getRestorationAlert(districtName, resolved.area, resolved.feeder);
        for (const sub of subscribers) {
          await sendTelegramMessage(sub.chat_id, message);
        }
      }
    }
  }

  return NextResponse.json({ status: 'success' });
}
```

**Change Detection Algorithm:**
```typescript
export async function detectOutageChanges(
  districtId: number,
  currentOutages: DHBVNData[]
): Promise<{ new: DHBVNData[], resolved: any[], ongoing: any[] }> {
  // 1. Generate hash for each outage (area + feeder + start_time)
  const currentHashes = new Set(
    currentOutages.map(o =>
      createHash('md5').update(`${o.area}|${o.feeder}|${o.start_time}`).digest('hex')
    )
  );

  // 2. Get existing active outages from database
  const existing = await getActiveOutages(districtId);
  const existingHashes = new Set(existing.map(o => o.outage_hash));

  // 3. Find NEW (in current but not in existing)
  const newOutages = currentOutages.filter(
    o => !existingHashes.has(generateHash(o))
  );

  // 4. Find RESOLVED (in existing but not in current)
  const resolvedHashes = [...existingHashes].filter(h => !currentHashes.has(h));
  const resolved = await markResolved(resolvedHashes);

  // 5. Save new outages to database
  for (const outage of newOutages) {
    await saveOutage(districtId, outage);
  }

  return { new: newOutages, resolved, ongoing: [] };
}
```

### 6. Vercel Cron Configuration (`vercel.json`)

```json
{
  "crons": [{
    "path": "/api/cron/check-outages",
    "schedule": "*/15 * * * *"
  }]
}
```

### 7. Environment Variables (`.env.example`)

```env
# Telegram Bot API
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather

# Application
NEXT_PUBLIC_BASE_URL=https://dhbvn.vercel.app

# Database (auto-set by Vercel Postgres)
# POSTGRES_URL=

# Cron Security
CRON_SECRET=your_random_secret
```

---

## 🚀 SETUP INSTRUCTIONS

### Step 1: Create Telegram Bot
1. Message @BotFather on Telegram
2. Send: `/newbot`
3. Name: `DHBVN Outage Alerts`
4. Username: `dhbvn_outage_bot`
5. Copy token: `6363456789:AAHdqTcvCH1vGWJxfSe2qRkYGy-XTABCDEF`

### Step 2: Set Webhook
After deploying, run:
```bash
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -d "url=https://dhbvn.vercel.app/api/telegram/webhook"
```

### Step 3: Initialize Database
```bash
psql $POSTGRES_URL -f lib/database/schema.sql
```

---

## ✅ TESTING CHECKLIST

1. **Bot responds to /start** - Shows welcome + district buttons
2. **District selection works** - Click button → subscription confirmed
3. **Status command works** - `/status` shows current outages
4. **Change command works** - `/change` shows district selector again
5. **Stop command works** - `/stop` unsubscribes user
6. **Cron job runs** - Check logs every 15 minutes
7. **Notifications sent** - New outages trigger alerts
8. **No duplicate notifications** - Same outage doesn't alert twice

---

## 🎯 SUCCESS CRITERIA

- ✅ User can subscribe via /start
- ✅ User receives inline keyboard with 12 districts
- ✅ Subscription is saved to database
- ✅ User receives confirmation with current outages
- ✅ Cron job runs every 15 minutes
- ✅ New outages trigger notifications to relevant subscribers
- ✅ Resolved outages send restoration messages
- ✅ No spam - only NEW changes trigger notifications
- ✅ All commands work: /start, /status, /change, /stop, /help

---

## 💡 IMPORTANT NOTES

1. **HTML Formatting**: Use `<b>bold</b>` for emphasis in messages
2. **Rate Limiting**: Add in-memory cache to prevent spam (10 msgs/min per user)
3. **Error Handling**: Always return 200 OK to Telegram webhook
4. **Change Detection**: Use MD5 hash of (area + feeder + start_time) as unique ID
5. **Database Queries**: Index on (district_id, is_active) for fast lookups
6. **Cron Security**: Protect with Bearer token in Authorization header
7. **Batch Messages**: Send notifications in parallel (Telegram has no strict rate limits)

---

## 🔒 SECURITY

- ✅ No webhook signature verification needed (Telegram doesn't require it)
- ✅ Protect cron endpoint with CRON_SECRET
- ✅ Rate limit webhook endpoint (10 messages/minute per chat_id)
- ✅ Validate district_id is 1-12
- ✅ Sanitize user inputs (though commands are predefined)

---

## 📦 DEPENDENCIES TO ADD

```bash
npm install @vercel/postgres node-cache
```

No Telegram-specific packages needed - use native fetch!

---

**NOW IMPLEMENT THIS COMPLETE SYSTEM** following the architecture and examples above. Create all files, implement all functions, and ensure the bot works end-to-end with:
1. Telegram webhook receiving messages
2. Interactive inline keyboards for district selection
3. Database storing subscriptions
4. Cron job checking for changes every 15 minutes
5. Smart notifications only for NEW outages or RESTORED power

The bot must be production-ready, handle errors gracefully, and work for thousands of users with ZERO monthly costs.
