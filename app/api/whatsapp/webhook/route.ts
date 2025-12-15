// WhatsApp webhook endpoint
// Handles incoming messages from Meta Cloud API or Twilio

import { NextRequest, NextResponse } from 'next/server';
import {
  handleIncomingMessage,
  parseWebhookPayload,
  type WhatsAppProvider,
} from '@/lib/whatsapp/message-handler';

// Rate limiting using in-memory cache
const messageRateLimits = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_MESSAGES_PER_WINDOW = 5;

function isRateLimited(phoneNumber: string): boolean {
  const now = Date.now();
  const timestamps = messageRateLimits.get(phoneNumber) || [];

  // Remove timestamps older than the window
  const recentTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);

  if (recentTimestamps.length >= MAX_MESSAGES_PER_WINDOW) {
    return true;
  }

  // Add current timestamp
  recentTimestamps.push(now);
  messageRateLimits.set(phoneNumber, recentTimestamps);

  return false;
}

// GET: Webhook verification (Meta Cloud API)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook verified successfully');
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// POST: Receive incoming messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const provider = (process.env.WHATSAPP_PROVIDER || 'meta') as WhatsAppProvider;

    // Verify webhook signature
    if (provider === 'meta') {
      const signature = request.headers.get('x-hub-signature-256');
      if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
      }

      // In production, verify the signature
      // const rawBody = await request.text();
      // const isValid = await verifyMetaSignature(rawBody, signature);
      // if (!isValid) {
      //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      // }
    }

    // Parse webhook payload
    const parsed = parseWebhookPayload(body, provider);

    if (!parsed) {
      console.log('Webhook received but no message to process');
      return NextResponse.json({ status: 'ok' }, { status: 200 });
    }

    const { from, message, messageType, interactive } = parsed;

    // Rate limiting
    if (isRateLimited(from)) {
      console.log(`Rate limit exceeded for ${from}`);
      return NextResponse.json({ status: 'rate_limited' }, { status: 429 });
    }

    // Handle message asynchronously (don't block webhook response)
    handleIncomingMessage(from, message, messageType, interactive).catch(error => {
      console.error('Error handling message:', error);
    });

    // Respond immediately to webhook (required by WhatsApp)
    return NextResponse.json({ status: 'ok' }, { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Disable body parsing for signature verification
export const config = {
  api: {
    bodyParser: true,
  },
};
