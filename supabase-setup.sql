-- Run this SQL in your Supabase SQL Editor
-- URL: https://rkdlmwpyyfbzlirbnkir.supabase.co

CREATE TABLE IF NOT EXISTS registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unique_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  what_you_do TEXT[] NOT NULL DEFAULT '{}',
  current_role TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  location TEXT NOT NULL,
  portfolio_link TEXT,
  haca_connection TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (form submissions from anyone)
CREATE POLICY "Allow public inserts" ON registrations
  FOR INSERT TO anon WITH CHECK (true);

-- Allow public reads (for counting unique IDs)
CREATE POLICY "Allow public reads" ON registrations
  FOR SELECT TO anon USING (true);

-- Index for fast counting
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at);
