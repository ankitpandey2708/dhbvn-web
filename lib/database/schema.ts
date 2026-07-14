import { pgTable, serial, integer, varchar, text, timestamp, boolean, bigint, jsonb, uniqueIndex, index } from 'drizzle-orm/pg-core';

// ────────────────────────────────────────────────────────────
// Table: Telegram Subscriptions
// ────────────────────────────────────────────────────────────
export const telegramSubscriptions = pgTable('telegram_subscriptions', {
  id:                    serial('id').primaryKey(),
  chatId:                varchar('chat_id', { length: 50 }).notNull().unique(),
  username:              varchar('username', { length: 100 }),
  districtId:            integer('district_id').notNull(),
  districtName:          varchar('district_name', { length: 50 }).notNull(),
  subscribedAt:          timestamp('subscribed_at').defaultNow(),
  lastNotificationSent:  timestamp('last_notification_sent'),
  isActive:              boolean('is_active').default(true),
  createdAt:             timestamp('created_at').defaultNow(),
  updatedAt:             timestamp('updated_at').defaultNow(),
});

// ────────────────────────────────────────────────────────────
// Table: Telegram Logs
// ────────────────────────────────────────────────────────────
export const telegramLogs = pgTable('telegram_logs', {
  id:            serial('id').primaryKey(),
  chatId:        varchar('chat_id', { length: 50 }),
  updateId:      bigint('update_id', { mode: 'number' }),
  type:          varchar('type', { length: 50 }).notNull(),
  payload:       jsonb('payload'),
  errorMessage:  text('error_message'),
  createdAt:     timestamp('created_at').defaultNow(),
}, (table) => ({
  idxCreatedAt: index('idx_logs_created_at').on(table.createdAt),
}));

// ────────────────────────────────────────────────────────────
// Table: Outage History (append-only, for ML / analytics)
// ────────────────────────────────────────────────────────────
export const outageHistory = pgTable('outage_history', {
  id:               serial('id').primaryKey(),
  districtId:       integer('district_id').notNull(),
  feeder:           text('feeder').notNull(),
  startTime:        text('start_time').notNull(),
  restorationTime:  text('restoration_time').notNull(),
  reason:           text('reason').notNull().default(''),
  createdAt:        timestamp('created_at').defaultNow(),
}, (table) => ({
  // Dedup: same feeder can't start two outages at the same timestamp in the same district
  dedupIdx: uniqueIndex('idx_outage_history_dedup')
    .on(table.districtId, table.feeder, table.startTime),
  // Query indexes for ML / analytics
  districtIdx: index('idx_outage_history_district').on(table.districtId),
  feederIdx:   index('idx_outage_history_feeder').on(table.feeder),
  createdIdx:  index('idx_outage_history_created').on(table.createdAt),
}));
