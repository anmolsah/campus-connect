/*
  # Add Campus Filter and OTP Support
  
  ## Changes
  1. Add `show_own_campus_only` column to profiles table
     - Boolean field to filter discovery to same campus
     - Defaults to false (show all campuses)
  
  2. Create `otp_codes` table for email verification
     - Stores OTP codes for email verification
     - Auto-expires after 10 minutes
*/

-- Add campus filter preference to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'show_own_campus_only'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN show_own_campus_only BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create OTP codes table for email verification
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON public.otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires ON public.otp_codes(expires_at);

-- Enable RLS on otp_codes
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to insert OTP codes (for signup)
DROP POLICY IF EXISTS "Anyone can create OTP codes" ON public.otp_codes;
CREATE POLICY "Anyone can create OTP codes"
  ON public.otp_codes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Allow reading OTP codes for verification
DROP POLICY IF EXISTS "Anyone can read OTP codes for verification" ON public.otp_codes;
CREATE POLICY "Anyone can read OTP codes for verification"
  ON public.otp_codes FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Allow updating OTP codes (for marking as verified)
DROP POLICY IF EXISTS "Anyone can update OTP codes" ON public.otp_codes;
CREATE POLICY "Anyone can update OTP codes"
  ON public.otp_codes FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow deleting expired OTP codes
DROP POLICY IF EXISTS "Anyone can delete OTP codes" ON public.otp_codes;
CREATE POLICY "Anyone can delete OTP codes"
  ON public.otp_codes FOR DELETE
  TO anon, authenticated
  USING (true);
