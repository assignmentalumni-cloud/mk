/*
# Financial Ledger Architecture — Deposit Proofs + Cashout Detail Columns

## Summary
Two schema changes to support manual deposit verification and detailed payout requests:

## 1. New Table: `pending_deposits`
Stores every manual deposit proof submission from a Tier-0 user.
Columns:
- id          (text PK)          — app-generated ID
- user_id     (text, FK→users)   — submitting user
- username    (text)             — denormalized display
- chosen_tier (integer)          — 1 or 2 ($35 or $70)
- sender_name (text)             — legal name on paying account
- sender_email(text)             — email linked to wallet/bank
- tx_hash     (text)             — blockchain tx hash or receipt number
- receipt_filename (text)        — uploaded screenshot filename
- status      (text)             — 'Pending' | 'Approved' | 'Declined'
- submitted_at(timestamptz)      — creation timestamp
- reviewed_at (timestamptz)      — nullable, set on admin action

## 2. Extend `cashout_requests`
New columns for full payout destination details:
- beneficiary_name    (text)     — wallet/account holder name
- wallet_address      (text)     — destination address or account number
- network_method      (text)     — e.g. 'USDT TRC-20', 'Binance Pay ID', 'Local Bank Transfer'

## 3. Extend `users`
New column:
- activation_status  (text)      — NULL | 'Activation_Pending' | 'Active'
  Used to show the "under review" lock screen after deposit submission.

## 4. Security
All tables/columns use the same open anon+authenticated RLS as the rest
of the schema (custom username-auth app, authorization enforced in app layer).
*/

-- ─── pending_deposits ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pending_deposits (
  id               text PRIMARY KEY,
  user_id          text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username         text NOT NULL,
  chosen_tier      integer NOT NULL,
  sender_name      text NOT NULL,
  sender_email     text NOT NULL,
  tx_hash          text NOT NULL,
  receipt_filename text,
  status           text NOT NULL DEFAULT 'Pending',
  submitted_at     timestamptz DEFAULT now(),
  reviewed_at      timestamptz
);

CREATE INDEX IF NOT EXISTS pending_deposits_user_id_idx ON pending_deposits(user_id);
CREATE INDEX IF NOT EXISTS pending_deposits_status_idx  ON pending_deposits(status);

ALTER TABLE pending_deposits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_pending_deposits" ON pending_deposits;
CREATE POLICY "anon_select_pending_deposits" ON pending_deposits FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_pending_deposits" ON pending_deposits;
CREATE POLICY "anon_insert_pending_deposits" ON pending_deposits FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_pending_deposits" ON pending_deposits;
CREATE POLICY "anon_update_pending_deposits" ON pending_deposits FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_pending_deposits" ON pending_deposits;
CREATE POLICY "anon_delete_pending_deposits" ON pending_deposits FOR DELETE
  TO anon, authenticated USING (true);

-- ─── extend cashout_requests ─────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cashout_requests' AND column_name = 'beneficiary_name'
  ) THEN
    ALTER TABLE cashout_requests ADD COLUMN beneficiary_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cashout_requests' AND column_name = 'wallet_address'
  ) THEN
    ALTER TABLE cashout_requests ADD COLUMN wallet_address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cashout_requests' AND column_name = 'network_method'
  ) THEN
    ALTER TABLE cashout_requests ADD COLUMN network_method text;
  END IF;
END $$;

-- ─── extend users ────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'activation_status'
  ) THEN
    ALTER TABLE users ADD COLUMN activation_status text;
  END IF;
END $$;
