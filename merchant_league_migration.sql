-- Run once against PostgreSQL before enabling Merchant League.
CREATE TABLE IF NOT EXISTS merchant_league_preferences (
  merchant_id INTEGER PRIMARY KEY REFERENCES merchants(id) ON DELETE CASCADE,
  opted_in BOOLEAN NOT NULL DEFAULT FALSE,
  display_alias TEXT NOT NULL DEFAULT 'Local Merchant',
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_league_transactions ON transactions(merchant_id, created_at, type);
