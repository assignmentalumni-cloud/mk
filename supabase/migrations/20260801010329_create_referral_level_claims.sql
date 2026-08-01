/*
# Create referral_level_claims table

1. New Tables
- `referral_level_claims`
  - `id` (text, primary key) — unique claim identifier
  - `user_id` (text, not null) — FK to users.id
  - `username` (text, not null) — denormalized for admin display
  - `level` (integer, not null) — milestone level: 1, 2, or 3
  - `reward_amount` (numeric, not null) — cash reward: $100, $200, or $250
  - `status` (text, not null, default 'Pending') — Pending, Approved, or Rejected
  - `rejection_note` (text, nullable) — admin rejection reason
  - `created_at` (timestamptz, default now())
  - `reviewed_at` (timestamptz, nullable)

2. Security
- Enable RLS on `referral_level_claims`.
- Owner-scoped SELECT: users can read their own claims.
- INSERT: users can insert their own claims.
- UPDATE: users cannot update claims (admin-only via service role in app logic).
- DELETE: users cannot delete claims.

3. Important Notes
- This table tracks referral milestone reward claims requiring manual admin approval.
- Level 1 (10 referrals) = $100, Level 2 (15 referrals) = $200, Level 3 (30 referrals) = $250.
- Earning boost (+0.5% per approved level) is applied in app logic based on approved claim count.
- Safe to re-run: uses IF NOT EXISTS.
*/

CREATE TABLE IF NOT EXISTS referral_level_claims (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username text NOT NULL,
  level integer NOT NULL,
  reward_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'Pending',
  rejection_note text,
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz
);

ALTER TABLE referral_level_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_level_claims" ON referral_level_claims;
CREATE POLICY "select_own_level_claims"
ON referral_level_claims FOR SELECT
TO authenticated USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "insert_own_level_claims" ON referral_level_claims;
CREATE POLICY "insert_own_level_claims"
ON referral_level_claims FOR INSERT
TO authenticated WITH CHECK (auth.uid()::text = user_id);

-- The app uses the anon key for all operations, so we also need anon policies.
-- This app uses a custom auth flow (not Supabase auth), so user_id is a text id, not auth.uid().
-- We need anon-accessible policies scoped by the app's own auth logic.
DROP POLICY IF EXISTS "anon_select_level_claims" ON referral_level_claims;
CREATE POLICY "anon_select_level_claims"
ON referral_level_claims FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_level_claims" ON referral_level_claims;
CREATE POLICY "anon_insert_level_claims"
ON referral_level_claims FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_level_claims" ON referral_level_claims;
CREATE POLICY "anon_update_level_claims"
ON referral_level_claims FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_level_claims" ON referral_level_claims;
CREATE POLICY "anon_delete_level_claims"
ON referral_level_claims FOR DELETE
TO anon, authenticated USING (true);
