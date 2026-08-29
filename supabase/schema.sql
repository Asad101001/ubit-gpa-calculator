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

-- 1.5. Prepare student_results for linking (Must be run first)
-- This ensures the seat_no column in student_results is UNIQUE so it can be referenced by profiles.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'student_results') THEN
    -- Try to add a unique constraint if it doesn't already have one
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'student_results_seat_no_key' OR conname = 'student_results_pkey'
    ) THEN
      ALTER TABLE student_results ADD CONSTRAINT student_results_seat_no_key UNIQUE (seat_no);
    END IF;
  END IF;
END $$;

-- 2. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  seat_no TEXT UNIQUE, -- UNIQUE prevents multiple users from claiming the same seat number
  is_admin BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  show_results_publicly BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5. Link profiles to student_results
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_seat_no'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT fk_seat_no FOREIGN KEY (seat_no) REFERENCES student_results(seat_no) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view visibility settings" ON profiles
  FOR SELECT USING (true);

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
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_results' AND policyname = 'Auth can update own results') THEN
      EXECUTE 'CREATE POLICY "Auth can update own results" ON student_results FOR UPDATE TO authenticated USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND (profiles.is_admin = true OR (profiles.is_verified = true AND profiles.seat_no = student_results.seat_no))
        )
      )';
    END IF;
  END IF;
END $$;

-- 6. Set your admin account (run AFTER you sign up)
-- Replace 'YOUR_EMAIL@gmail.com' with your actual email
-- UPDATE profiles SET is_admin = true, is_verified = true WHERE email = 'YOUR_EMAIL@gmail.com';

-- 7. Add Semester 3 columns to student_results table with default 'Results Unannounced'
ALTER TABLE student_results 
  ADD COLUMN IF NOT EXISTS cs451 TEXT DEFAULT 'Results Unannounced',
  ADD COLUMN IF NOT EXISTS cs453 TEXT DEFAULT 'Results Unannounced',
  ADD COLUMN IF NOT EXISTS cs455 TEXT DEFAULT 'Results Unannounced',
  ADD COLUMN IF NOT EXISTS cs457 TEXT DEFAULT 'Results Unannounced',
  ADD COLUMN IF NOT EXISTS cs459 TEXT DEFAULT 'Results Unannounced',
  ADD COLUMN IF NOT EXISTS cs461 TEXT DEFAULT 'Results Unannounced';

