// Telegram webhook endpoint
// Handles incoming messages and callback queries from Telegram Bot API

import { NextRequest, NextResponse } from 'next/server';
import {
  handleTelegramUpdate,
  parseTelegramWebhook,
} from '@/lib/messaging/telegram-handler';

// Rate limiting using in-memory cache
const messageRateLimits = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_MESSAGES_PER_WINDOW = 10; // Telegram can handle more

function isRateLimited(chatId: string): boolean {
  const now = Date.now();
  const timestamps = messageRateLimits.get(chatId) || [];

  // Remove timestamps older than the window
  const recentTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);

  if (recentTimestamps.length >= MAX_MESSAGES_PER_WINDOW) {
    return true;
  }

  // Add current timestamp
  recentTimestamps.push(now);
  messageRateLimits.set(chatId, recentTimestamps);

  return false;
}

// POST: Receive incoming Telegram updates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Parse Telegram webhook payload
    const parsed = parseTelegramWebhook(body);

    if (!parsed) {
      console.log('Telegram webhook received but no message to process');
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const { chatId, message, username, messageType, callbackQueryId } = parsed;

    // Rate limiting
    if (isRateLimited(chatId)) {
      console.log(`Rate limit exceeded for chat ${chatId}`);
      // Still return OK to Telegram (they don't care about our rate limits)
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Handle update asynchronously (don't block webhook response)
    handleTelegramUpdate(chatId, message, username, callbackQueryId).catch(error => {
      console.error('Error handling Telegram update:', error);
    });

    // Respond immediately to webhook (required by Telegram)
    return NextResponse.json({ ok: true }, { status: 200 });

  } catch (error) {
    console.error('Telegram webhook error:', error);
    // Still return OK to Telegram to avoid retries
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}

// Telegram doesn't require GET verification, but we can add a health check
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'Telegram webhook endpoint is running'
  }, { status: 200 });
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
