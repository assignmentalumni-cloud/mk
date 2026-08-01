/*
# Add avatar_url column to users table

1. Modified Tables
- `users`
  - Added `avatar_url` (text, nullable) — stores the user's profile picture URL.
    Null when no avatar has been uploaded.

2. Security
- No RLS or policy changes. Existing policies on `users` remain unchanged.
- No auth settings altered.

3. Important Notes
- Purely additive column; existing rows unaffected (default null).
- Safe to re-run: uses a DO $$ guard.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE users ADD COLUMN avatar_url text;
  END IF;
END $$;
