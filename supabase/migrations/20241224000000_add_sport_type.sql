-- Add sport type enum
CREATE TYPE sport_type AS ENUM ('football', 'baseball');

-- Add sport_type column to contests
ALTER TABLE contests ADD COLUMN sport_type sport_type DEFAULT 'football' NOT NULL;

