/*
# Add phone column to users table

1. Changes
- Adds `phone` (text, nullable) column to the `users` table.
- This supports the profile completeness requirement on the Settings page.
2. Security
- No RLS policy changes needed — existing policies on `users` already cover the new column.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'phone'
  ) THEN
    ALTER TABLE users ADD COLUMN phone text;
  END IF;
END $$;
