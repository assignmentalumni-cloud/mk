-- Add lifetime_withdrawals column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS lifetime_withdrawals INTEGER DEFAULT 0;

-- Update existing users to have the field
UPDATE users SET lifetime_withdrawals = 0 WHERE lifetime_withdrawals IS NULL;