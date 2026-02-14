-- Run this in your Supabase SQL Editor to create the necessary table

CREATE TABLE IF NOT EXISTS listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  farmer_name TEXT NOT NULL,
  crop_type TEXT NOT NULL,
  quantity_kg NUMERIC NOT NULL,
  location TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  grade TEXT,
  price_per_kg NUMERIC,
  image_url TEXT,
  saturation_level TEXT DEFAULT 'medium'
);

-- Enable Row Level Security (RLS)
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Create Policy to allow public read access
CREATE POLICY "Allow public read access" 
ON listings FOR SELECT 
USING (true);

-- Create Policy to allow public insert access (for demo purposes)
CREATE POLICY "Allow public insert access" 
ON listings FOR INSERT 
WITH CHECK (true);
