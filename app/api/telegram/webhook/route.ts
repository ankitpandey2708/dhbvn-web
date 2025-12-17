// Telegram webhook endpoint
// Handles incoming messages and callback queries from Telegram Bot API

import { NextRequest, NextResponse } from 'next/server';
import {
  handleTelegramUpdate,
  parseTelegramWebhook,
} from '@/lib/messaging/telegram-handler';
import { logTelegramEvent } from '@/lib/database/logs';


// Rate limiting using in-memory cache
const messageRateLimits = new Map<string, number[]>();
const processedUpdates = new Map<number, number>(); // Store update_id -> timestamp
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_MESSAGES_PER_WINDOW = 10; // Telegram can handle more
const DEDUPE_WINDOW = 60000; // 1 minute window for deduplication

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

function isDuplicateUpdate(updateId: number): boolean {
  const now = Date.now();

  // Clean up old updates
  processedUpdates.forEach((timestamp, id) => {
    if (now - timestamp > DEDUPE_WINDOW) {
      processedUpdates.delete(id);
    }
  });

  if (processedUpdates.has(updateId)) {
    return true;
  }

  processedUpdates.set(updateId, now);
  return false;
}

// POST: Receive incoming Telegram updates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Parse Telegram webhook payload
    const parsed = parseTelegramWebhook(body);

    // Deduplication check
    if (body.update_id && isDuplicateUpdate(body.update_id)) {
      console.log(`Duplicate update ignored: ${body.update_id}`);
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (!parsed) {
      console.log('Telegram webhook received but no message to process');
      // Log raw payload even if parsing failed (unless empty)
      if (body) {
        await logTelegramEvent({
          type: 'webhook_payload',
          payload: body,
          updateId: body.update_id
        }).catch(err => console.error('Log error', err));
      }
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Log the parsed event
    await logTelegramEvent({
      type: 'incoming_message',
      chatId: parsed.chatId,
      updateId: body.update_id,
      payload: {
        text: parsed.message,
        user: parsed.username,
        messageType: parsed.messageType
      }
    }).catch(console.error);


    const { chatId, message, username, messageType, callbackQueryId } = parsed;

    // Rate limiting
    if (isRateLimited(chatId)) {
      console.log(`Rate limit exceeded for chat ${chatId}`);
      // Still return OK to Telegram (they don't care about our rate limits)
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Handle update synchronously to ensure it completes before Vercel freezes execution
    try {
      await handleTelegramUpdate(chatId, message, username, callbackQueryId);
    } catch (error) {
      console.error('Error handling Telegram update:', error);
    }

    // Respond to webhook
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
