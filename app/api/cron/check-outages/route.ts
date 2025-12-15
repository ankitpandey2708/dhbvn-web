// Cron job to check for outages and send notifications
// Should be triggered every 15 minutes via Vercel Cron or GitHub Actions

import { NextRequest, NextResponse } from 'next/server';
import {
  getActiveDistricts,
  getSubscriptionsByDistrict,
} from '@/lib/database/subscriptions';
import {
  detectOutageChanges,
  DHBVNData,
} from '@/lib/database/outages';
import { sendBatchMessages } from '@/lib/messaging/telegram-client';
import * as templates from '@/lib/messaging/telegram-templates';

// Fetch outages from the DHBVN API
async function fetchOutagesForDistrict(districtId: number): Promise<DHBVNData[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const url = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

    const response = await fetch(`${url}/api/dhbvn?district=${districtId}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Failed to fetch outages for district ${districtId}:`, response.statusText);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching outages for district ${districtId}:`, error);
    return [];
  }
}

// Process a single district: check for changes and notify subscribers
async function processDistrict(districtId: number, districtName: string) {
  console.log(`Processing district ${districtId} (${districtName})`);

  // Fetch current outages
  const currentOutages = await fetchOutagesForDistrict(districtId);

  // Detect changes
  const changes = await detectOutageChanges(districtId, currentOutages);

  // Get subscribers for this district
  const subscribers = await getSubscriptionsByDistrict(districtId);

  if (subscribers.length === 0) {
    console.log(`No subscribers for district ${districtId}`);
    return { districtId, districtName, subscribers: 0, newOutages: 0, resolved: 0 };
  }

  const notifications: Array<{ chatId: string; message: string }> = [];

  // Send notifications for new outages
  if (changes.new.length > 0) {
    const message = templates.getNewOutageAlert(districtName, changes.new);

    for (const subscriber of subscribers) {
      notifications.push({
        chatId: subscriber.chat_id,
        message,
      });
    }

    console.log(`${changes.new.length} new outages in ${districtName}, notifying ${subscribers.length} subscribers`);
  }

  // Send notifications for resolved outages
  if (changes.resolved.length > 0) {
    for (const resolved of changes.resolved) {
      const message = templates.getRestorationAlert(
        districtName,
        resolved.area,
        resolved.feeder
      );

      for (const subscriber of subscribers) {
        notifications.push({
          chatId: subscriber.chat_id,
          message,
        });
      }
    }

    console.log(`${changes.resolved.length} outages resolved in ${districtName}`);
  }

  // Send all notifications in batch
  if (notifications.length > 0) {
    const results = await sendBatchMessages(notifications);
    console.log(`Sent ${results.success}/${notifications.length} notifications for ${districtName}`);

    return {
      districtId,
      districtName,
      subscribers: subscribers.length,
      newOutages: changes.new.length,
      resolved: changes.resolved.length,
      sent: results.success,
      failed: results.failed,
    };
  }

  return {
    districtId,
    districtName,
    subscribers: subscribers.length,
    newOutages: 0,
    resolved: 0,
    sent: 0,
    failed: 0,
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting outage check cron job');

    // Get all districts with active subscriptions
    const activeDistricts = await getActiveDistricts();

    if (activeDistricts.length === 0) {
      console.log('No active subscriptions, skipping outage check');
      return NextResponse.json({
        status: 'success',
        message: 'No active subscriptions',
        duration: Date.now() - startTime,
      });
    }

    console.log(`Checking ${activeDistricts.length} districts with active subscriptions`);

    // Process all districts
    const results = await Promise.all(
      activeDistricts.map(async (districtId) => {
        const { DISTRICTS } = await import('@/lib/database/subscriptions');
        const district = DISTRICTS.find(d => d.id === districtId);
        const districtName = district?.name || 'Unknown';

        return processDistrict(districtId, districtName);
      })
    );

    // Calculate totals
    const totals = results.reduce(
      (acc, result) => ({
        subscribers: acc.subscribers + result.subscribers,
        newOutages: acc.newOutages + result.newOutages,
        resolved: acc.resolved + result.resolved,
        sent: acc.sent + result.sent,
        failed: acc.failed + result.failed,
      }),
      { subscribers: 0, newOutages: 0, resolved: 0, sent: 0, failed: 0 }
    );

    const duration = Date.now() - startTime;

    console.log(`Cron job completed in ${duration}ms`, totals);

    return NextResponse.json({
      status: 'success',
      duration,
      districtsChecked: activeDistricts.length,
      totals,
      details: results,
    });

  } catch (error) {
    console.error('Cron job error:', error);

    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

// Disable static generation for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;
