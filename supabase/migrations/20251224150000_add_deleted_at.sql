-- Add soft delete column to contests
ALTER TABLE contests ADD COLUMN deleted_at TIMESTAMPTZ NULL;

-- Add index for querying non-deleted contests
CREATE INDEX idx_contests_deleted_at ON contests(deleted_at);

-- Update RLS policies to exclude deleted contests
DROP POLICY IF EXISTS "Users can view their own contests" ON contests;
CREATE POLICY "Users can view their own contests"
  ON contests FOR SELECT
  USING (auth.uid() = owner_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can view public contests" ON contests;
CREATE POLICY "Users can view public contests"
  ON contests FOR SELECT
  USING (is_public = true AND status != 'draft' AND deleted_at IS NULL);

