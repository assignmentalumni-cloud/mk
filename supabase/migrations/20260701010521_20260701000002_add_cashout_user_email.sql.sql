/*
# Add user email to cashout requests

Add user_email column to cashout_requests table for strict form collection.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cashout_requests' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE cashout_requests ADD COLUMN user_email text;
  END IF;
END $$;
