-- Add baseball game payout columns to contests
ALTER TABLE contests 
  ADD COLUMN payout_game1_percent INTEGER DEFAULT 10,
  ADD COLUMN payout_game2_percent INTEGER DEFAULT 10,
  ADD COLUMN payout_game3_percent INTEGER DEFAULT 10,
  ADD COLUMN payout_game4_percent INTEGER DEFAULT 10,
  ADD COLUMN payout_game5_percent INTEGER DEFAULT 15,
  ADD COLUMN payout_game6_percent INTEGER DEFAULT 15,
  ADD COLUMN payout_game7_percent INTEGER DEFAULT 30;

