// Database operations for Telegram subscriptions

import { eq, sql } from 'drizzle-orm';
import { db } from '../database/db';
import { telegramSubscriptions } from '../database/schema';
import { getDistrictName } from '../district';

export interface Subscription {
  id: number;
  chat_id: string;
  username: string | null;
  district_id: number;
  district_name: string;
  subscribed_at: Date;
  last_notification_sent: Date | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Create or update a subscription
export async function upsertSubscription(
  chatId: string,
  districtId: number,
  username?: string
): Promise<Subscription> {
  if (!db) throw new Error('Database not configured (POSTGRES_URL missing)');

  const districtName = getDistrictName(districtId);

  const [result] = await db.insert(telegramSubscriptions)
    .values({
      chatId,
      username: username ?? null,
      districtId,
      districtName,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: telegramSubscriptions.chatId,
      set: {
        districtId,
        districtName,
        username: username ?? null,
        isActive: true,
        updatedAt: sql`NOW()`,
      },
    })
    .returning();

  return result as unknown as Subscription;
}

// Get subscription by chat ID
export async function getSubscription(chatId: string): Promise<Subscription | null> {
  if (!db) return null;

  const result = await db.query.telegramSubscriptions.findFirst({
    where: eq(telegramSubscriptions.chatId, chatId),
  });

  return (result as unknown as Subscription) ?? null;
}

// Unsubscribe a user
export async function unsubscribe(chatId: string): Promise<boolean> {
  if (!db) return false;

  const [result] = await db.update(telegramSubscriptions)
    .set({
      isActive: false,
      updatedAt: sql`NOW()`,
    })
    .where(eq(telegramSubscriptions.chatId, chatId))
    .returning({ id: telegramSubscriptions.id });

  return !!result;
}
