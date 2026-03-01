-- Tony's Madness 2026 - Database Setup
-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brackets table (one per user)
CREATE TABLE IF NOT EXISTS brackets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  picks JSONB DEFAULT '{}',
  locked BOOLEAN DEFAULT FALSE,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tournament results table (real game outcomes, updated by Open Claw agent)
CREATE TABLE IF NOT EXISTS tournament_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id TEXT UNIQUE NOT NULL,
  winner_team_key TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_results ENABLE ROW LEVEL SECURITY;

-- Policies: allow all access (simple for small private tournament)
CREATE POLICY "Allow all users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all brackets" ON brackets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all results" ON tournament_results FOR ALL USING (true) WITH CHECK (true);
