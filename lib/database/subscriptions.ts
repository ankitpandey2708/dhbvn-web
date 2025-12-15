// Database operations for WhatsApp subscriptions

import { sql } from '@vercel/postgres';

export interface Subscription {
  id: number;
  phone_number: string;
  district_id: number;
  district_name: string;
  subscribed_at: Date;
  last_notification_sent: Date | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// District mapping (from app/page.tsx)
export const DISTRICTS = [
  { id: 1, name: 'Jind' },
  { id: 2, name: 'Fatehabad' },
  { id: 3, name: 'Sirsa' },
  { id: 4, name: 'Hisar' },
  { id: 5, name: 'Bhiwani' },
  { id: 6, name: 'Mahendargarh' },
  { id: 7, name: 'Rewari' },
  { id: 8, name: 'Gurugram' },
  { id: 9, name: 'Nuh' },
  { id: 10, name: 'Faridabad' },
  { id: 11, name: 'Palwal' },
  { id: 12, name: 'Charkhi Dadri' },
] as const;

export function getDistrictName(districtId: number): string {
  const district = DISTRICTS.find(d => d.id === districtId);
  return district?.name || 'Unknown';
}

// Create or update a subscription
export async function upsertSubscription(
  phoneNumber: string,
  districtId: number
): Promise<Subscription> {
  const districtName = getDistrictName(districtId);

  const result = await sql`
    INSERT INTO whatsapp_subscriptions (phone_number, district_id, district_name, is_active)
    VALUES (${phoneNumber}, ${districtId}, ${districtName}, true)
    ON CONFLICT (phone_number)
    DO UPDATE SET
      district_id = ${districtId},
      district_name = ${districtName},
      is_active = true,
      updated_at = NOW()
    RETURNING *
  `;

  return result.rows[0] as Subscription;
}

// Get subscription by phone number
export async function getSubscription(phoneNumber: string): Promise<Subscription | null> {
  const result = await sql`
    SELECT * FROM whatsapp_subscriptions
    WHERE phone_number = ${phoneNumber}
  `;

  return result.rows[0] as Subscription || null;
}

// Get all active subscriptions for a district
export async function getSubscriptionsByDistrict(districtId: number): Promise<Subscription[]> {
  const result = await sql`
    SELECT * FROM whatsapp_subscriptions
    WHERE district_id = ${districtId} AND is_active = true
    ORDER BY subscribed_at DESC
  `;

  return result.rows as Subscription[];
}

// Get all active districts (that have subscribers)
export async function getActiveDistricts(): Promise<number[]> {
  const result = await sql`
    SELECT DISTINCT district_id
    FROM whatsapp_subscriptions
    WHERE is_active = true
    ORDER BY district_id
  `;

  return result.rows.map(row => row.district_id);
}

// Unsubscribe a user
export async function unsubscribe(phoneNumber: string): Promise<boolean> {
  const result = await sql`
    UPDATE whatsapp_subscriptions
    SET is_active = false, updated_at = NOW()
    WHERE phone_number = ${phoneNumber}
  `;

  return result.rowCount > 0;
}

// Resubscribe a user (in case they stopped and want to restart)
export async function resubscribe(phoneNumber: string): Promise<boolean> {
  const result = await sql`
    UPDATE whatsapp_subscriptions
    SET is_active = true, updated_at = NOW()
    WHERE phone_number = ${phoneNumber}
  `;

  return result.rowCount > 0;
}

// Update last notification sent timestamp
export async function updateLastNotification(phoneNumber: string): Promise<void> {
  await sql`
    UPDATE whatsapp_subscriptions
    SET last_notification_sent = NOW()
    WHERE phone_number = ${phoneNumber}
  `;
}

// Get subscription stats (for admin/monitoring)
export async function getStats() {
  const result = await sql`
    SELECT
      COUNT(*) as total_subscriptions,
      COUNT(*) FILTER (WHERE is_active = true) as active_subscriptions,
      COUNT(DISTINCT district_id) FILTER (WHERE is_active = true) as active_districts
    FROM whatsapp_subscriptions
  `;

  return result.rows[0];
}

// Get subscriptions by district with counts (for admin dashboard)
export async function getDistrictStats() {
  const result = await sql`
    SELECT
      district_id,
      district_name,
      COUNT(*) as subscriber_count
    FROM whatsapp_subscriptions
    WHERE is_active = true
    GROUP BY district_id, district_name
    ORDER BY subscriber_count DESC
  `;

  return result.rows;
}
