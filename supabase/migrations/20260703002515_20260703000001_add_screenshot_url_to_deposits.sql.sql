/*
# Add Screenshot URL to Pending Deposits

Add screenshot_url column to store receipt image URLs for admin review.
*/

ALTER TABLE pending_deposits ADD COLUMN IF NOT EXISTS screenshot_url text;
