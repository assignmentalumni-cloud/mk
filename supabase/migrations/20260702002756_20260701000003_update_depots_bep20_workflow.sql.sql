/*
# BEP-20 Deposit Workflow Update

Update pending_deposits table:
- Remove sender_name column (no longer collecting legal name)
- Rename tx_hash to sender_wallet_address (collecting BEP-20 wallet address)
*/

-- Rename tx_hash to sender_wallet_address
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pending_deposits' AND column_name = 'tx_hash'
  ) THEN
    ALTER TABLE pending_deposits RENAME COLUMN tx_hash TO sender_wallet_address;
  END IF;
END $$;

-- Remove sender_name column (optional - keep for backwards compatibility, rename to username field)
-- We'll keep sender_name for now but the form will collect username instead
-- The form sends username to sender_name field for backwards compatibility

-- Make sender_wallet_address required for new submissions
-- (Existing records may have NULL values from old workflow)
