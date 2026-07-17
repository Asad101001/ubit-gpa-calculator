-- ============================================
-- UBIT GPA Calculator - Auth & Profiles Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Helper function to check admin status (bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  seat_no TEXT UNIQUE,
  is_admin BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  show_results_publicly BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for profiles
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin can read all profiles" ON profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can update all profiles" ON profiles
  FOR UPDATE USING (is_admin());

-- 5. Ensure student_results has anon read access (for edge functions)
-- If RLS is not enabled on student_results, this is a no-op
-- If it is enabled, ensure anon can read
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE tablename = 'student_results' AND rowsecurity = true
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_results' AND policyname = 'Anon can read student_results') THEN
      EXECUTE 'CREATE POLICY "Anon can read student_results" ON student_results FOR SELECT TO anon USING (true)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_results' AND policyname = 'Auth can read student_results') THEN
      EXECUTE 'CREATE POLICY "Auth can read student_results" ON student_results FOR SELECT TO authenticated USING (true)';
    END IF;
  END IF;
END $$;

-- 6. Set your admin account (run AFTER you sign up)
-- Replace 'YOUR_EMAIL@gmail.com' with your actual email
-- UPDATE profiles SET is_admin = true, is_verified = true WHERE email = 'YOUR_EMAIL@gmail.com';
