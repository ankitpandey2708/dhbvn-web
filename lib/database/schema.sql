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

-- Table: Outage snapshots for change detection
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_active_subscriptions
  ON telegram_subscriptions(is_active, district_id);

CREATE INDEX IF NOT EXISTS idx_chat_lookup
  ON telegram_subscriptions(chat_id);

CREATE INDEX IF NOT EXISTS idx_district_active
  ON outage_snapshots(district_id, is_resolved);

CREATE INDEX IF NOT EXISTS idx_outage_hash
  ON outage_snapshots(outage_hash);

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
