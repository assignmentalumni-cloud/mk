/*
# Anti-Fraud Referral System

Add invited_by column to users table to track referral relationships.
- invited_by stores the username of the referrer
- Referrals only count toward cycle after deposit approval
*/

ALTER TABLE users ADD COLUMN IF NOT EXISTS invited_by text;

-- Create index for faster referral lookups
CREATE INDEX IF NOT EXISTS idx_users_invited_by ON users(invited_by);
