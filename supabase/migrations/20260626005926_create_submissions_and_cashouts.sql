/*
# Create submissions and cashout_requests tables

## Summary
Lifts submissions and cashout requests from ephemeral in-memory state into durable
Supabase tables so they survive page refreshes and are visible across user sessions
(e.g. a user submits, the admin panel sees it immediately without any shared memory).

## 1. New Tables

### `submissions`
Stores every assignment submission made by any user.

| Column | Type | Description |
|--------|------|-------------|
| id | text PK | App-generated ID (e.g. "sub-<timestamp>") |
| user_id | text NOT NULL | References users.id |
| username | text NOT NULL | Denormalized for display |
| topic_id | text NOT NULL | Which assignment topic was submitted |
| topic_title | text NOT NULL | Display title of the topic |
| submitted_text | text NOT NULL | The essay text content |
| file_proof_name | text | Optional uploaded file name |
| status | text NOT NULL DEFAULT 'Submitted_Pending' | 'Submitted_Pending' | 'Approved' | 'Rejected' |
| calculated_payout | numeric NOT NULL | $1.30 (Tier I) or $1.70 (Tier II) |
| submitted_at | timestamptz DEFAULT now() | Submission timestamp |

### `cashout_requests`
Stores every withdrawal request made by any user.

| Column | Type | Description |
|--------|------|-------------|
| id | text PK | App-generated ID (e.g. "cashout-<timestamp>") |
| user_id | text NOT NULL | References users.id |
| username | text NOT NULL | Denormalized for display |
| amount | numeric NOT NULL | Requested withdrawal amount |
| status | text NOT NULL DEFAULT 'Pending' | 'Pending' | 'Completed' |
| created_at | timestamptz DEFAULT now() | Request creation timestamp |
| processed_at | timestamptz | Set when admin confirms payout |

## 2. Security
Both tables use RLS with `TO anon, authenticated` policies (open read/write) because
this app uses custom username-based auth — the frontend always operates as the `anon`
role. Authorization is enforced in the application layer.

## 3. Indexes
- `submissions(user_id)` for per-user queries
- `submissions(status)` for admin "pending" filter
- `cashout_requests(user_id)` for per-user queries
- `cashout_requests(status)` for admin "pending" filter
*/

CREATE TABLE IF NOT EXISTS submissions (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username text NOT NULL,
  topic_id text NOT NULL,
  topic_title text NOT NULL,
  submitted_text text NOT NULL,
  file_proof_name text,
  status text NOT NULL DEFAULT 'Submitted_Pending',
  calculated_payout numeric NOT NULL,
  submitted_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS submissions_user_id_idx ON submissions(user_id);
CREATE INDEX IF NOT EXISTS submissions_status_idx ON submissions(status);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_submissions" ON submissions;
CREATE POLICY "anon_select_submissions" ON submissions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_submissions" ON submissions;
CREATE POLICY "anon_insert_submissions" ON submissions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_submissions" ON submissions;
CREATE POLICY "anon_update_submissions" ON submissions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_submissions" ON submissions;
CREATE POLICY "anon_delete_submissions" ON submissions FOR DELETE
  TO anon, authenticated USING (true);


CREATE TABLE IF NOT EXISTS cashout_requests (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username text NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

CREATE INDEX IF NOT EXISTS cashout_requests_user_id_idx ON cashout_requests(user_id);
CREATE INDEX IF NOT EXISTS cashout_requests_status_idx ON cashout_requests(status);

ALTER TABLE cashout_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_cashouts" ON cashout_requests;
CREATE POLICY "anon_select_cashouts" ON cashout_requests FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_cashouts" ON cashout_requests;
CREATE POLICY "anon_insert_cashouts" ON cashout_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_cashouts" ON cashout_requests;
CREATE POLICY "anon_update_cashouts" ON cashout_requests FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_cashouts" ON cashout_requests;
CREATE POLICY "anon_delete_cashouts" ON cashout_requests FOR DELETE
  TO anon, authenticated USING (true);
