/*
# Add File Proof URL to Submissions

Add file_proof_url column to store uploaded file URLs for photo document submissions.
*/

ALTER TABLE submissions ADD COLUMN IF NOT EXISTS file_proof_url text;
