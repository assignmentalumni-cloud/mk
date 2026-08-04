/*
# Add multi-photo proof URLs and penalty/fine transaction system

1. Submissions table changes
- Add `proof_urls` column (text[]) to `submissions` table.
  This stores an array of Supabase storage public URLs for all photos/documents
  uploaded with a single assignment submission (multi-file upload feature).
  The existing `file_proof_url` column remains for backward compatibility
  with older single-file submissions.

2. New table: `penalty_transactions`
- Records every fine/penalty deduction applied by an admin to a user account.
- Columns:
  - `id` (text, primary key) — unique penalty record ID
  - `user_id` (text, not null) — the user who was fined
  - `username` (text, not null) — denormalized username for display
  - `amount` (numeric, not null) — the fine amount deducted
  - `reason` (text) — optional reason (e.g. "ChatGPT / AI content detected")
  - `created_at` (timestamptz, default now)
- RLS enabled with anon+authenticated CRUD (app uses anon-key client with its own auth layer).

3. Security
- RLS enabled on `penalty_transactions`.
- CRUD policies for `anon, authenticated` — the app manages its own auth and access control.
*/

-- Add proof_urls column to submissions
ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS proof_urls text[] DEFAULT '{}';

-- Create penalty_transactions table
CREATE TABLE IF NOT EXISTS penalty_transactions (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  reason text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE penalty_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_penalty_transactions" ON penalty_transactions;
CREATE POLICY "anon_select_penalty_transactions"
  ON penalty_transactions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_penalty_transactions" ON penalty_transactions;
CREATE POLICY "anon_insert_penalty_transactions"
  ON penalty_transactions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_penalty_transactions" ON penalty_transactions;
CREATE POLICY "anon_update_penalty_transactions"
  ON penalty_transactions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_penalty_transactions" ON penalty_transactions;
CREATE POLICY "anon_delete_penalty_transactions"
  ON penalty_transactions FOR DELETE
  TO anon, authenticated USING (true);
