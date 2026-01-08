-- Add player tracking support to contests
ALTER TABLE public.contests
ADD COLUMN enable_player_tracking BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN players JSONB NOT NULL DEFAULT '[]';

-- Add referred_by to squares for tracking who referred each claim
ALTER TABLE public.squares
ADD COLUMN referred_by TEXT;

-- Index for efficient lookups by referrer
CREATE INDEX idx_squares_referred_by ON public.squares(referred_by);

