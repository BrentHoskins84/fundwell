-- =============================================
-- GRIDDO CONTESTS FEATURE
-- Super Bowl Squares / Game Day Fundraiser
-- =============================================

-- Contest status enum
CREATE TYPE contest_status AS ENUM (
  'draft',
  'open', 
  'locked',
  'in_progress',
  'completed'
);

-- Payment status enum
CREATE TYPE payment_status AS ENUM (
  'available',
  'pending',
  'paid'
);

-- Payment option type enum
CREATE TYPE payment_option_type AS ENUM (
  'venmo',
  'paypal',
  'cashapp',
  'zelle',
  'other'
);

-- Quarter enum
CREATE TYPE game_quarter AS ENUM (
  'q1',
  'q2',
  'q3',
  'final'
);

-- =============================================
-- CONTESTS TABLE
-- =============================================
CREATE TABLE contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Identification
  code TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  
  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  status contest_status DEFAULT 'draft' NOT NULL,
  is_public BOOLEAN DEFAULT false NOT NULL,
  
  -- Branding
  hero_image_url TEXT,
  org_image_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#1E40AF',
  
  -- Game settings
  square_price DECIMAL(10,2) NOT NULL,
  max_squares_per_person INTEGER,
  row_team_name TEXT NOT NULL,
  col_team_name TEXT NOT NULL,
  row_numbers INTEGER[],
  col_numbers INTEGER[],
  numbers_auto_generated BOOLEAN DEFAULT false,
  
  -- Payouts
  payout_q1_percent INTEGER DEFAULT 20,
  payout_q2_percent INTEGER DEFAULT 20,
  payout_q3_percent INTEGER DEFAULT 20,
  payout_final_percent INTEGER DEFAULT 40,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- SQUARES TABLE
-- =============================================
CREATE TABLE squares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID REFERENCES contests(id) ON DELETE CASCADE NOT NULL,
  
  -- Position
  row_index INTEGER NOT NULL CHECK (row_index >= 0 AND row_index <= 9),
  col_index INTEGER NOT NULL CHECK (col_index >= 0 AND col_index <= 9),
  
  -- Claimant info
  claimant_first_name TEXT,
  claimant_last_name TEXT,
  claimant_email TEXT,
  claimant_venmo TEXT,
  
  -- Status
  payment_status payment_status DEFAULT 'available' NOT NULL,
  claimed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  
  -- Unique constraint
  UNIQUE(contest_id, row_index, col_index)
);

-- =============================================
-- PAYMENT OPTIONS TABLE
-- =============================================
CREATE TABLE payment_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID REFERENCES contests(id) ON DELETE CASCADE NOT NULL,
  
  type payment_option_type NOT NULL,
  handle_or_link TEXT NOT NULL,
  display_name TEXT,
  instructions TEXT,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- SCORES TABLE
-- =============================================
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID REFERENCES contests(id) ON DELETE CASCADE NOT NULL,
  
  quarter game_quarter NOT NULL,
  home_score INTEGER NOT NULL,
  away_score INTEGER NOT NULL,
  winning_square_id UUID REFERENCES squares(id),
  
  entered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(contest_id, quarter)
);

-- =============================================
-- EMAIL LOG TABLE
-- =============================================
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID REFERENCES contests(id) ON DELETE CASCADE NOT NULL,
  square_id UUID REFERENCES squares(id) ON DELETE SET NULL,
  
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL,
  resend_id TEXT,
  status TEXT DEFAULT 'sent',
  
  sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE squares ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Contests policies
CREATE POLICY "Users can view their own contests"
  ON contests FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can view public contests"
  ON contests FOR SELECT
  USING (is_public = true AND status != 'draft');

CREATE POLICY "Users can create contests"
  ON contests FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own contests"
  ON contests FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own contests"
  ON contests FOR DELETE
  USING (auth.uid() = owner_id);

-- Squares policies (anyone can view, claim if available)
CREATE POLICY "Anyone can view squares"
  ON squares FOR SELECT
  USING (true);

CREATE POLICY "Anyone can claim available squares"
  ON squares FOR UPDATE
  USING (payment_status = 'available')
  WITH CHECK (payment_status = 'pending');

CREATE POLICY "Contest owners can manage all squares"
  ON squares FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM contests 
      WHERE contests.id = squares.contest_id 
      AND contests.owner_id = auth.uid()
    )
  );

-- Payment options policies
CREATE POLICY "Anyone can view payment options"
  ON payment_options FOR SELECT
  USING (true);

CREATE POLICY "Contest owners can manage payment options"
  ON payment_options FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM contests 
      WHERE contests.id = payment_options.contest_id 
      AND contests.owner_id = auth.uid()
    )
  );

-- Scores policies
CREATE POLICY "Anyone can view scores"
  ON scores FOR SELECT
  USING (true);

CREATE POLICY "Contest owners can manage scores"
  ON scores FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM contests 
      WHERE contests.id = scores.contest_id 
      AND contests.owner_id = auth.uid()
    )
  );

-- Email logs policies (owner only)
CREATE POLICY "Contest owners can view email logs"
  ON email_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM contests 
      WHERE contests.id = email_logs.contest_id 
      AND contests.owner_id = auth.uid()
    )
  );

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_contests_owner ON contests(owner_id);
CREATE INDEX idx_contests_code ON contests(code);
CREATE INDEX idx_contests_slug ON contests(slug);
CREATE INDEX idx_contests_status ON contests(status);
CREATE INDEX idx_squares_contest ON squares(contest_id);
CREATE INDEX idx_squares_status ON squares(payment_status);
CREATE INDEX idx_payment_options_contest ON payment_options(contest_id);
CREATE INDEX idx_scores_contest ON scores(contest_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contests_updated_at
  BEFORE UPDATE ON contests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Initialize 100 squares when contest is created
CREATE OR REPLACE FUNCTION initialize_squares()
RETURNS TRIGGER AS $$
BEGIN
  FOR r IN 0..9 LOOP
    FOR c IN 0..9 LOOP
      INSERT INTO squares (contest_id, row_index, col_index)
      VALUES (NEW.id, r, c);
    END LOOP;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_contest_squares
  AFTER INSERT ON contests
  FOR EACH ROW
  EXECUTE FUNCTION initialize_squares();

-- =============================================
-- REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE squares;
ALTER PUBLICATION supabase_realtime ADD TABLE scores;

