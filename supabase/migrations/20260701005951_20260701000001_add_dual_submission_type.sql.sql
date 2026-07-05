/*
# Dual Submission Type Support

Add columns to submissions table to support both local text and photo document submissions.

Columns added:
- submission_type (text): 'local_text' or 'photo_document'
- estimated_word_count (integer): User-entered word count for photo submissions
- char_count (integer): Character count for text submissions
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'submission_type'
  ) THEN
    ALTER TABLE submissions ADD COLUMN submission_type text NOT NULL DEFAULT 'local_text';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'estimated_word_count'
  ) THEN
    ALTER TABLE submissions ADD COLUMN estimated_word_count integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'char_count'
  ) THEN
    ALTER TABLE submissions ADD COLUMN char_count integer;
  END IF;
END $$;
