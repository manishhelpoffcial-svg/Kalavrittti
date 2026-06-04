-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rrkdjtolgwlwaygsgghn/sql/new

CREATE TABLE IF NOT EXISTS seller_applications (
  id SERIAL PRIMARY KEY,
  application_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  age INTEGER,
  dob TEXT,
  gender TEXT,
  mobile TEXT NOT NULL,
  mobile_verified BOOLEAN DEFAULT FALSE,
  email TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  category_name TEXT,
  category_description TEXT,
  aadhaar_url TEXT,
  pan_card_url TEXT,
  gst_number TEXT,
  business_name TEXT,
  business_address TEXT,
  video_kyc_requested BOOLEAN DEFAULT FALSE,
  account_holder_name TEXT,
  bank_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  upi_id TEXT,
  terms_accepted BOOLEAN DEFAULT FALSE,
  privacy_accepted BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending',
  supabase_user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OTP store table (temporary, in-DB OTP storage)
CREATE TABLE IF NOT EXISTS otp_store (
  id SERIAL PRIMARY KEY,
  target TEXT NOT NULL,
  otp TEXT NOT NULL,
  type TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_seller_applications_updated_at
  BEFORE UPDATE ON seller_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
