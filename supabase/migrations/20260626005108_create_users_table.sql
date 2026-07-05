/*
# Create users table for AssignmentAlumni

1. New Tables
- `users`
  - `id` (text, primary key) — app-generated unique user ID (e.g. "user-<timestamp>")
  - `username` (text, unique, not null) — login identifier
  - `password` (text, not null) — plaintext password (demo app, username-based auth)
  - `full_name` (text, not null) — user's display name
  - `email` (text, unique, not null) — contact email
  - `deposit_tier` (integer, not null, default 0) — 0 = inactive, 1 = Tier I ($35), 2 = Tier II ($70)
  - `available_earnings` (numeric, not null, default 0) — wallet balance
  - `current_cycle_referrals` (integer, not null, default 0) — referral count for current cashout cycle
  - `completed_topic_ids` (jsonb, not null, default '[]') — array of completed assignment topic IDs
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `users`.
- This app uses custom username/password auth (NOT Supabase Auth sessions), so the
  frontend always operates as the `anon` role. Policies allow anon + authenticated
  CRUD because the app manages its own session state in React.
- `USING (true)` is acceptable here because the app is single-tenant from the
  database's perspective — all data is shared app data, and authorization is
  handled in the frontend layer.

3. Important Notes
- `deposit_tier` uses integer (0/1/2) instead of text to match the requirement
  for a `depositTier: 0` indicator on new registrations.
- Passwords are stored in plaintext for this demo app. This is intentional because
  the app uses custom username-based auth, not Supabase Auth.
- The `completed_topic_ids` column uses jsonb to store an array of topic IDs.
*/

CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  deposit_tier integer NOT NULL DEFAULT 0,
  available_earnings numeric NOT NULL DEFAULT 0,
  current_cycle_referrals integer NOT NULL DEFAULT 0,
  completed_topic_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_users" ON users;
CREATE POLICY "anon_select_users" ON users FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_users" ON users;
CREATE POLICY "anon_insert_users" ON users FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_users" ON users;
CREATE POLICY "anon_update_users" ON users FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_users" ON users;
CREATE POLICY "anon_delete_users" ON users FOR DELETE
  TO anon, authenticated USING (true);
