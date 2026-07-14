-- Telegram Bot Database Schema for DHBVN

-- Table: User subscriptions
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



-- Auto-update updated_at timestamp
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

-- Sample data for testing (optional)
-- Uncomment to insert test subscription
-- INSERT INTO telegram_subscriptions (chat_id, username, district_id, district_name)
-- VALUES ('123456789', 'testuser', 10, 'Faridabad');
-- Table: Telegram Logs (Retained for 24 hours)
CREATE TABLE IF NOT EXISTS telegram_logs (
  id SERIAL PRIMARY KEY,
  chat_id VARCHAR(50),
  update_id BIGINT,
  type VARCHAR(50) NOT NULL, -- 'incoming_message', 'outgoing_message', 'error', 'webhook_payload'
  payload JSONB,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_created_at ON telegram_logs(created_at);

-- ──────────────────────────────────────────────────────────────
-- Table: Outage History (append-only, for ML / analytics)
-- Every row from the DHBVN XML response is saved here before
-- the active-outage filter drops expired entries. One row per
-- raw XML row (pre-grouping, pre-filtering).
-- Retention: no TTL — keep forever. ~2400 rows/hour worst case.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS outage_history (
  id                SERIAL PRIMARY KEY,
  district_id       INTEGER NOT NULL CHECK (district_id BETWEEN 1 AND 12),  -- 1-12 (matches districts.json)
  feeder            TEXT NOT NULL,              -- normalized feeder name
  start_time        TEXT NOT NULL,              -- IST string, e.g. "16-Apr-2025 10:24:00"
  restoration_time  TEXT NOT NULL,              -- IST string
  reason            TEXT NOT NULL DEFAULT '',   -- from ADDRESS field
  created_at        TIMESTAMP DEFAULT NOW()     -- when we observed this row
);

-- Dedup: same feeder can't start two outages at the same timestamp in the same district
CREATE UNIQUE INDEX IF NOT EXISTS idx_outage_history_dedup
  ON outage_history(district_id, feeder, start_time);

-- Query indexes for ML / analytics
CREATE INDEX IF NOT EXISTS idx_outage_history_district ON outage_history(district_id);
CREATE INDEX IF NOT EXISTS idx_outage_history_feeder ON outage_history(feeder);
CREATE INDEX IF NOT EXISTS idx_outage_history_created ON outage_history(created_at);
