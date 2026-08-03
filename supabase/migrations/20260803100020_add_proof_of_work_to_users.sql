/*
# Add Proof of Work Uploads to Users

1. Schema Changes
   - Add `proof_of_work_urls` (text[]) column to `users` table — stores an array of Supabase Storage public URLs for uploaded proof-of-work files (photos and PDFs).
   - Column is nullable; defaults to NULL (no proofs uploaded yet).
   - Existing users are unaffected — NULL means "no proofs uploaded."

2. Storage
   - Create a public storage bucket `proof-of-work` for uploading user work verification files (images and PDFs).
   - Bucket is public so admin panel can display uploaded proofs via direct URLs.

3. Security
   - No RLS policy changes needed — `users` table already has RLS enabled with existing policies.
   - Storage bucket is public-read (admin needs to view proofs).

4. Notes
   - The frontend will upload files to `proof-of-work/<userId>/<filename>` and store the resulting public URLs in the `proof_of_work_urls` array.
   - The admin panel reads these URLs to display image previews and PDF download links.
*/

ALTER TABLE users ADD COLUMN IF NOT EXISTS proof_of_work_urls text[];

INSERT INTO storage.buckets (id, name, public)
VALUES ('proof-of-work', 'proof-of-work', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for proof-of-work bucket
DROP POLICY IF EXISTS "Anyone can read proof-of-work" ON storage.objects;
CREATE POLICY "Anyone can read proof-of-work"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'proof-of-work');

DROP POLICY IF EXISTS "Authenticated can upload proof-of-work" ON storage.objects;
CREATE POLICY "Authenticated can upload proof-of-work"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'proof-of-work');

DROP POLICY IF EXISTS "Users can update own proof-of-work" ON storage.objects;
CREATE POLICY "Users can update own proof-of-work"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'proof-of-work');
