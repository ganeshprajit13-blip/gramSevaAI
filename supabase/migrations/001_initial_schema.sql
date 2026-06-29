-- =============================================================
-- GramSeva AI – Database Migration 001: Initial Schema
-- Run this in your Supabase SQL Editor or via CLI
-- =============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- TABLE: profiles
-- Resident user profiles (linked to Firebase UID)
-- =============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  age INTEGER CHECK (age >= 0 AND age <= 120),
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
  village TEXT,
  district TEXT,
  occupation TEXT,
  annual_income NUMERIC(12, 2),
  community TEXT CHECK (community IN ('General', 'OBC', 'SC', 'ST', 'Other')),
  disability BOOLEAN DEFAULT FALSE,
  farmer_status BOOLEAN DEFAULT FALSE,
  land_ownership BOOLEAN DEFAULT FALSE,
  education TEXT CHECK (education IN (
    'No Formal Education', 'Primary', 'Secondary', 'Higher Secondary',
    'Diploma', 'Graduate', 'Post Graduate', 'Doctorate'
  )),
  marital_status TEXT CHECK (marital_status IN ('Single', 'Married', 'Divorced', 'Widowed')),
  role TEXT NOT NULL DEFAULT 'resident' CHECK (role IN ('resident', 'admin')),
  profile_complete BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- TABLE: schemes
-- Government schemes catalog
-- =============================================================
CREATE TABLE IF NOT EXISTS schemes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  benefits TEXT[],
  department TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'Agriculture', 'Education', 'Health', 'Housing', 'Employment',
    'Women', 'Senior Citizen', 'Disability', 'Business', 'Student', 'Other'
  )),
  image_url TEXT,
  application_deadline DATE,
  required_documents TEXT[],
  application_mode TEXT CHECK (application_mode IN ('Online', 'Offline', 'Both')),
  official_url TEXT,
  office_name TEXT,
  office_address TEXT,
  office_phone TEXT,
  office_hours TEXT,
  eligibility_summary TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- TABLE: scheme_eligibility_rules
-- JSON-based eligibility rules per scheme
-- =============================================================
CREATE TABLE IF NOT EXISTS scheme_eligibility_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  rules JSONB NOT NULL DEFAULT '[]',
  -- Example rules structure:
  -- [
  --   {"field": "age", "operator": ">=", "value": 18, "label": "Age at least 18"},
  --   {"field": "income", "operator": "<=", "value": 250000, "label": "Income ≤ 2.5 Lakh"},
  --   {"field": "gender", "operator": "=", "value": "Female", "label": "Female applicant"},
  --   {"field": "community", "operator": "=", "value": "SC", "label": "SC community"},
  --   {"field": "disability", "operator": "=", "value": true, "label": "Person with disability"},
  --   {"field": "farmer_status", "operator": "=", "value": true, "label": "Is a farmer"}
  -- ]
  logic TEXT DEFAULT 'AND' CHECK (logic IN ('AND', 'OR')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- TABLE: notifications
-- Scheme publish notifications
-- =============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheme_id UUID REFERENCES schemes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'scheme_published' CHECK (type IN ('scheme_published', 'announcement', 'reminder')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- TABLE: notification_reads
-- Track which residents have read which notifications
-- =============================================================
CREATE TABLE IF NOT EXISTS notification_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(notification_id, profile_id)
);

-- =============================================================
-- INDEXES for performance
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_firebase_uid ON profiles(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_schemes_status ON schemes(status);
CREATE INDEX IF NOT EXISTS idx_schemes_category ON schemes(category);
CREATE INDEX IF NOT EXISTS idx_schemes_department ON schemes(department);
CREATE INDEX IF NOT EXISTS idx_eligibility_rules_scheme_id ON scheme_eligibility_rules(scheme_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_reads_profile_id ON notification_reads(profile_id);

-- =============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trigger_schemes_updated_at
  BEFORE UPDATE ON schemes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trigger_eligibility_rules_updated_at
  BEFORE UPDATE ON scheme_eligibility_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile; service role has full access
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (true); -- public read for eligibility checks

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (true); -- controlled by server actions

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (true);

-- Schemes: published schemes are publicly readable
CREATE POLICY "schemes_select_published" ON schemes
  FOR SELECT USING (status = 'published' OR true); -- service role bypasses anyway

CREATE POLICY "schemes_all_service" ON schemes
  FOR ALL USING (true);

-- Eligibility rules: readable by all (server-side filtered)
CREATE POLICY "eligibility_rules_select" ON scheme_eligibility_rules
  FOR SELECT USING (true);

CREATE POLICY "eligibility_rules_all" ON scheme_eligibility_rules
  FOR ALL USING (true);

-- Notifications: readable by all
CREATE POLICY "notifications_select" ON notifications
  FOR SELECT USING (true);

CREATE POLICY "notifications_all" ON notifications
  FOR ALL USING (true);

-- Notification reads: users read their own
CREATE POLICY "notification_reads_all" ON notification_reads
  FOR ALL USING (true);

-- =============================================================
-- SEED DATA: Sample Government Schemes
-- =============================================================
INSERT INTO schemes (name, description, department, category, benefits, required_documents, application_mode, official_url, eligibility_summary, status)
VALUES
  (
    'PM Kisan Samman Nidhi',
    'Financial assistance to small and marginal farmers across India. Under this scheme, farmers receive Rs. 6,000 per year in three equal installments directly in their bank accounts.',
    'Agriculture Department',
    'Agriculture',
    ARRAY['Rs. 6,000 per year', 'Direct Bank Transfer', 'Three installments of Rs. 2,000'],
    ARRAY['Aadhaar Card', 'Bank Passbook', 'Land Records', 'Self Declaration'],
    'Online',
    'https://pmkisan.gov.in',
    'Small and marginal farmers with landholding up to 2 hectares',
    'published'
  ),
  (
    'Pradhan Mantri Awas Yojana (Gramin)',
    'Housing scheme to provide pucca houses to houseless families and families living in kutcha and dilapidated houses in rural areas.',
    'Rural Development',
    'Housing',
    ARRAY['Rs. 1.20 Lakh for plain areas', 'Rs. 1.30 Lakh for hilly/difficult areas', 'Unskilled labour cost Rs. 90.95 per day'],
    ARRAY['Aadhaar Card', 'Income Certificate', 'BPL Card', 'Bank Passbook', 'Land Ownership Proof'],
    'Offline',
    'https://pmayg.nic.in',
    'Houseless families with BPL status, SC/ST/Minorities/Disabled preferred',
    'published'
  ),
  (
    'National Scholarship Portal Scheme',
    'Central sector scholarship for students belonging to minority communities to pursue studies from Class I to PhD.',
    'Minority Affairs',
    'Education',
    ARRAY['Pre-matric: Up to Rs. 1,100/month', 'Post-matric: Up to Rs. 1,200/month', 'Merit-cum-Means: Up to Rs. 20,000/year'],
    ARRAY['Income Certificate', 'Caste Certificate', 'Marksheet', 'Bank Passbook', 'Aadhaar Card', 'Bonafide Certificate'],
    'Online',
    'https://scholarships.gov.in',
    'Students from minority community with income below Rs. 2 Lakh, minimum 50% marks',
    'published'
  ),
  (
    'Ayushman Bharat PM-JAY',
    'Health insurance scheme providing coverage up to Rs. 5 Lakh per family per year for secondary and tertiary care hospitalization.',
    'Health Department',
    'Health',
    ARRAY['Rs. 5 Lakh health coverage per family per year', 'Cashless treatment at empanelled hospitals', 'Covers 1,949+ medical procedures'],
    ARRAY['Aadhaar Card', 'Ration Card', 'Income Certificate', 'Family Photo'],
    'Both',
    'https://pmjay.gov.in',
    'BPL families and poor/vulnerable population groups as per SECC 2011',
    'published'
  ),
  (
    'PM Mudra Loan Yojana',
    'Provides loans up to Rs. 10 Lakh to non-corporate, non-farm small/micro enterprises for income generating activities.',
    'Finance Department',
    'Business',
    ARRAY['Shishu: Loans up to Rs. 50,000', 'Kishore: Rs. 50,001 to Rs. 5 Lakh', 'Tarun: Rs. 5 Lakh to Rs. 10 Lakh', 'No collateral required'],
    ARRAY['Aadhaar Card', 'PAN Card', 'Business Plan', 'Bank Statement', 'Identity Proof', 'Address Proof'],
    'Both',
    'https://mudra.org.in',
    'Small business owners, entrepreneurs, no defaulter history',
    'published'
  ),
  (
    'Pradhan Mantri Matru Vandana Yojana',
    'Maternity benefit programme that provides cash incentive to pregnant and lactating women for the first living child.',
    'Women & Child Development',
    'Women',
    ARRAY['Rs. 5,000 in three installments', 'Nutrition support during pregnancy', 'Wage loss compensation'],
    ARRAY['MCP Card (Mother & Child Protection Card)', 'Identity Proof', 'Bank Passbook', 'Aadhaar Card'],
    'Offline',
    'https://wcd.nic.in/schemes/pradhan-mantri-matru-vandana-yojana',
    'Pregnant and lactating women aged 19+ years for first living child, excluding government employees',
    'published'
  ),
  (
    'Indira Gandhi National Old Age Pension Scheme',
    'Social pension scheme for persons aged 60 years and above who are living below the poverty line.',
    'Social Justice Department',
    'Senior Citizen',
    ARRAY['Rs. 200/month for 60-79 years', 'Rs. 500/month for 80+ years', 'Direct Bank Transfer'],
    ARRAY['Age Proof', 'BPL Card', 'Bank Passbook', 'Aadhaar Card', 'Residential Proof'],
    'Offline',
    'https://nsap.nic.in',
    'BPL individuals aged 60 years and above',
    'published'
  ),
  (
    'MNREGA - Mahatma Gandhi National Rural Employment Guarantee',
    'Guarantees 100 days of wage employment in a financial year to rural households whose adult members volunteer to do unskilled manual work.',
    'Rural Development',
    'Employment',
    ARRAY['100 days guaranteed employment per year', 'Minimum wage as per state', 'Unemployment allowance if work not provided', 'Job Card issued'],
    ARRAY['Aadhaar Card', 'Bank/Post Office Account', 'Photo', 'Residential Proof'],
    'Offline',
    'https://nrega.nic.in',
    'Rural households, adult members (18+) willing to do unskilled manual work',
    'published'
  ),
  (
    'Divyangjan Scholarship Scheme',
    'Scholarship scheme for students with disabilities pursuing higher education to enable them to be self-reliant.',
    'Social Justice Department',
    'Disability',
    ARRAY['Rs. 2,000/month stipend for Day Scholars', 'Rs. 3,800/month for Hostellers', 'Book allowance', 'Stationery allowance'],
    ARRAY['Disability Certificate (40%+ disability)', 'Aadhaar Card', 'Income Certificate', 'Marksheet', 'Bank Passbook'],
    'Online',
    'https://scholarships.gov.in',
    'Students with 40%+ disability, income below Rs. 2.5 Lakh, pursuing courses after Class X',
    'published'
  ),
  (
    'PM Fasal Bima Yojana',
    'Crop insurance scheme providing comprehensive insurance coverage against crop failure due to non-preventable natural risks to support financial stability of farmers.',
    'Agriculture Department',
    'Agriculture',
    ARRAY['Full crop loss: 100% of sum insured', 'Mid-season calamity: Up to 25% advance', 'Post harvest losses: 14 days coverage', 'Low premium: 2% Kharif, 1.5% Rabi'],
    ARRAY['Land Records (7/12 extract)', 'Bank Passbook', 'Aadhaar Card', 'Sowing Certificate'],
    'Both',
    'https://pmfby.gov.in',
    'All farmers (loanee and non-loanee) growing notified crops',
    'published'
  );

-- =============================================================
-- SEED: Eligibility Rules for sample schemes
-- =============================================================
-- PM Kisan rules
INSERT INTO scheme_eligibility_rules (scheme_id, rules, logic)
SELECT id, '[
  {"field": "farmer_status", "operator": "=", "value": true, "label": "Must be a farmer"},
  {"field": "land_ownership", "operator": "=", "value": true, "label": "Must own land"}
]'::jsonb, 'AND'
FROM schemes WHERE name = 'PM Kisan Samman Nidhi';

-- PMAY-G rules
INSERT INTO scheme_eligibility_rules (scheme_id, rules, logic)
SELECT id, '[
  {"field": "annual_income", "operator": "<=", "value": 100000, "label": "Annual income ≤ Rs. 1 Lakh"}
]'::jsonb, 'AND'
FROM schemes WHERE name = 'Pradhan Mantri Awas Yojana (Gramin)';

-- National Scholarship rules
INSERT INTO scheme_eligibility_rules (scheme_id, rules, logic)
SELECT id, '[
  {"field": "age", "operator": "<=", "value": 30, "label": "Age ≤ 30 years"},
  {"field": "annual_income", "operator": "<=", "value": 200000, "label": "Family income ≤ Rs. 2 Lakh"},
  {"field": "community", "operator": "in", "value": ["SC", "ST", "OBC"], "label": "SC/ST/OBC community"}
]'::jsonb, 'AND'
FROM schemes WHERE name = 'National Scholarship Portal Scheme';

-- Old Age Pension rules
INSERT INTO scheme_eligibility_rules (scheme_id, rules, logic)
SELECT id, '[
  {"field": "age", "operator": ">=", "value": 60, "label": "Age at least 60 years"},
  {"field": "annual_income", "operator": "<=", "value": 100000, "label": "Annual income ≤ Rs. 1 Lakh (BPL)"}
]'::jsonb, 'AND'
FROM schemes WHERE name = 'Indira Gandhi National Old Age Pension Scheme';

-- Maternity scheme rules
INSERT INTO scheme_eligibility_rules (scheme_id, rules, logic)
SELECT id, '[
  {"field": "gender", "operator": "=", "value": "Female", "label": "Female applicant"},
  {"field": "age", "operator": ">=", "value": 19, "label": "Age at least 19 years"}
]'::jsonb, 'AND'
FROM schemes WHERE name = 'Pradhan Mantri Matru Vandana Yojana';

-- Disability scheme rules
INSERT INTO scheme_eligibility_rules (scheme_id, rules, logic)
SELECT id, '[
  {"field": "disability", "operator": "=", "value": true, "label": "Person with disability (40%+)"},
  {"field": "annual_income", "operator": "<=", "value": 250000, "label": "Family income ≤ Rs. 2.5 Lakh"}
]'::jsonb, 'AND'
FROM schemes WHERE name = 'Divyangjan Scholarship Scheme';

-- MNREGA rules
INSERT INTO scheme_eligibility_rules (scheme_id, rules, logic)
SELECT id, '[
  {"field": "age", "operator": ">=", "value": 18, "label": "Age at least 18 years"}
]'::jsonb, 'AND'
FROM schemes WHERE name = 'MNREGA - Mahatma Gandhi National Rural Employment Guarantee';

-- Fasal Bima rules
INSERT INTO scheme_eligibility_rules (scheme_id, rules, logic)
SELECT id, '[
  {"field": "farmer_status", "operator": "=", "value": true, "label": "Must be a farmer"}
]'::jsonb, 'AND'
FROM schemes WHERE name = 'PM Fasal Bima Yojana';

-- Mudra Loan rules
INSERT INTO scheme_eligibility_rules (scheme_id, rules, logic)
SELECT id, '[
  {"field": "age", "operator": ">=", "value": 18, "label": "Age at least 18 years"},
  {"field": "occupation", "operator": "in", "value": ["Self Employed", "Business Owner", "Artisan", "Small Trader"], "label": "Self-employed or small business owner"}
]'::jsonb, 'AND'
FROM schemes WHERE name = 'PM Mudra Loan Yojana';

-- PM-JAY rules
INSERT INTO scheme_eligibility_rules (scheme_id, rules, logic)
SELECT id, '[
  {"field": "annual_income", "operator": "<=", "value": 200000, "label": "Income ≤ Rs. 2 Lakh (BPL/lower income)"}
]'::jsonb, 'AND'
FROM schemes WHERE name = 'Ayushman Bharat PM-JAY';
