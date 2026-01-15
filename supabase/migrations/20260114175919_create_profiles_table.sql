CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  college_name TEXT NOT NULL,
  major TEXT NOT NULL,
  graduation_year INTEGER,
  bio TEXT DEFAULT '',
  id_card_url TEXT,
  is_verified BOOLEAN DEFAULT TRUE,
  current_mode TEXT DEFAULT 'social' CHECK (current_mode IN ('study', 'social', 'project')),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_mode ON public.profiles(current_mode);
CREATE INDEX IF NOT EXISTS idx_profiles_college ON public.profiles(college_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active DESC);;
