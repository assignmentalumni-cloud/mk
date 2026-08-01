/*
# Add rejection feedback column to submissions

1. Modified Tables
- `submissions`
  - Added `rejection_feedback` (text, nullable) — stores the admin's custom
    rejection note that gets surfaced to the user on their Working page.
    Null when a submission is approved or has not been rejected yet.

2. Security
- No RLS or policy changes. Existing policies on `submissions` remain unchanged.
- No auth settings altered.

3. Important Notes
- This is a purely additive column; existing rows are unaffected (default null).
- Safe to re-run: uses a DO $$ guard so the column is only added once.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'rejection_feedback'
  ) THEN
    ALTER TABLE submissions ADD COLUMN rejection_feedback text;
  END IF;
END $$;
