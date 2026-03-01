import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase: SupabaseClient = supabaseUrl
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as SupabaseClient); // Will be null until env vars are configured

// SQL to create tables (run in Supabase SQL editor):
/*
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brackets table
CREATE TABLE brackets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  picks JSONB DEFAULT '{}',
  locked BOOLEAN DEFAULT FALSE,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tournament results table (for scoring)
CREATE TABLE tournament_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id TEXT UNIQUE NOT NULL,
  winner_team_key TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_results ENABLE ROW LEVEL SECURITY;

-- Policies: allow all access (simple setup for small tournament)
CREATE POLICY "Allow all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON brackets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON tournament_results FOR ALL USING (true) WITH CHECK (true);
*/
