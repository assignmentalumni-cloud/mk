/*
# Anti-Cheat Task Restriction Engine — Submission Ledger

Add `last_submissions_ledger` column to users table to track submission timestamps
for the 24-hour rolling window task limit enforcement.

Column: last_submissions_ledger (jsonb) — array of ISO timestamp strings
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'last_submissions_ledger'
  ) THEN
    ALTER TABLE users ADD COLUMN last_submissions_ledger jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;
END $$;
