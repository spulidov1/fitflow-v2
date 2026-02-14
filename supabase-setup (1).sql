-- ============================================================================
-- FITFLOW V2.0 - SUPABASE SETUP SQL
-- ============================================================================
-- Run these commands in your Supabase SQL Editor
-- Execute in order from top to bottom
-- ============================================================================

-- ============================================================================
-- STEP 1: ADD NEW COLUMNS TO EXISTING TABLES
-- ============================================================================

-- Add preferences JSONB column to profiles for settings
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS daily_calorie_goal INTEGER DEFAULT 2000,
ADD COLUMN IF NOT EXISTS unit_preference VARCHAR(10) DEFAULT 'lbs',
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS family_group_id UUID;

-- Add soft delete support to all entry tables
ALTER TABLE weight_entries ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE calorie_entries ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE wellness_entries ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE mood_entries ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE progress_photos ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add privacy settings to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT 
'{
  "weight": "private",
  "calories": "private", 
  "photos": "private",
  "mood": "private",
  "wellness": "private"
}'::jsonb;

-- ============================================================================
-- STEP 2: CREATE FAMILY GROUPS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS family_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  invite_code VARCHAR(20) UNIQUE NOT NULL,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create family group members junction table
CREATE TABLE IF NOT EXISTS family_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_group_id UUID NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  opted_in BOOLEAN DEFAULT true,
  UNIQUE(family_group_id, user_id)
);

-- ============================================================================
-- STEP 3: ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE calorie_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_group_members ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: DROP EXISTING POLICIES (if any) TO AVOID CONFLICTS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view own weight entries" ON weight_entries;
DROP POLICY IF EXISTS "Users can insert own weight entries" ON weight_entries;
DROP POLICY IF EXISTS "Users can delete own weight entries" ON weight_entries;

DROP POLICY IF EXISTS "Users can view own calorie entries" ON calorie_entries;
DROP POLICY IF EXISTS "Users can insert own calorie entries" ON calorie_entries;
DROP POLICY IF EXISTS "Users can delete own calorie entries" ON calorie_entries;

DROP POLICY IF EXISTS "Users can view own wellness entries" ON wellness_entries;
DROP POLICY IF EXISTS "Users can insert own wellness entries" ON wellness_entries;
DROP POLICY IF EXISTS "Users can delete own wellness entries" ON wellness_entries;

DROP POLICY IF EXISTS "Users can view own progress photos" ON progress_photos;
DROP POLICY IF EXISTS "Users can insert own progress photos" ON progress_photos;
DROP POLICY IF EXISTS "Users can delete own progress photos" ON progress_photos;

DROP POLICY IF EXISTS "Users can view own mood entries" ON mood_entries;
DROP POLICY IF EXISTS "Users can insert own mood entries" ON mood_entries;
DROP POLICY IF EXISTS "Users can delete own mood entries" ON mood_entries;

DROP POLICY IF EXISTS "Users can view own family groups" ON family_groups;
DROP POLICY IF EXISTS "Users can insert family groups" ON family_groups;
DROP POLICY IF EXISTS "Users can update own family groups" ON family_groups;
DROP POLICY IF EXISTS "Users can delete own family groups" ON family_groups;

DROP POLICY IF EXISTS "Users can view family group members" ON family_group_members;
DROP POLICY IF EXISTS "Users can insert family group members" ON family_group_members;
DROP POLICY IF EXISTS "Users can delete family group members" ON family_group_members;

-- ============================================================================
-- STEP 5: CREATE RLS POLICIES FOR PROFILES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- STEP 6: CREATE RLS POLICIES FOR WEIGHT ENTRIES
-- ============================================================================

-- Users can only view their own non-deleted weight entries
CREATE POLICY "Users can view own weight entries" ON weight_entries
  FOR SELECT USING (
    auth.uid() = user_id AND deleted_at IS NULL
  );

-- Users can insert their own weight entries
CREATE POLICY "Users can insert own weight entries" ON weight_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can soft-delete their own weight entries
CREATE POLICY "Users can delete own weight entries" ON weight_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can permanently delete their own entries
CREATE POLICY "Users can permanently delete own weight entries" ON weight_entries
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 7: CREATE RLS POLICIES FOR CALORIE ENTRIES
-- ============================================================================

CREATE POLICY "Users can view own calorie entries" ON calorie_entries
  FOR SELECT USING (
    auth.uid() = user_id AND deleted_at IS NULL
  );

CREATE POLICY "Users can insert own calorie entries" ON calorie_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own calorie entries" ON calorie_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can permanently delete own calorie entries" ON calorie_entries
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 8: CREATE RLS POLICIES FOR WELLNESS ENTRIES
-- ============================================================================

CREATE POLICY "Users can view own wellness entries" ON wellness_entries
  FOR SELECT USING (
    auth.uid() = user_id AND deleted_at IS NULL
  );

CREATE POLICY "Users can insert own wellness entries" ON wellness_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wellness entries" ON wellness_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can permanently delete own wellness entries" ON wellness_entries
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 9: CREATE RLS POLICIES FOR PROGRESS PHOTOS
-- ============================================================================

CREATE POLICY "Users can view own progress photos" ON progress_photos
  FOR SELECT USING (
    auth.uid() = user_id AND deleted_at IS NULL
  );

CREATE POLICY "Users can insert own progress photos" ON progress_photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress photos" ON progress_photos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can permanently delete own progress photos" ON progress_photos
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 10: CREATE RLS POLICIES FOR MOOD ENTRIES
-- ============================================================================

CREATE POLICY "Users can view own mood entries" ON mood_entries
  FOR SELECT USING (
    auth.uid() = user_id AND deleted_at IS NULL
  );

CREATE POLICY "Users can insert own mood entries" ON mood_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood entries" ON mood_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood entries" ON mood_entries
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 11: CREATE RLS POLICIES FOR FAMILY GROUPS
-- ============================================================================

-- Users can view family groups they admin or are members of
CREATE POLICY "Users can view own family groups" ON family_groups
  FOR SELECT USING (
    auth.uid() = admin_user_id OR 
    EXISTS (
      SELECT 1 FROM family_group_members 
      WHERE family_group_id = id AND user_id = auth.uid()
    )
  );

-- Any authenticated user can create a family group
CREATE POLICY "Users can insert family groups" ON family_groups
  FOR INSERT WITH CHECK (auth.uid() = admin_user_id);

-- Only admins can update their family groups
CREATE POLICY "Users can update own family groups" ON family_groups
  FOR UPDATE USING (auth.uid() = admin_user_id);

-- Only admins can delete their family groups
CREATE POLICY "Users can delete own family groups" ON family_groups
  FOR DELETE USING (auth.uid() = admin_user_id);

-- ============================================================================
-- STEP 12: CREATE RLS POLICIES FOR FAMILY GROUP MEMBERS
-- ============================================================================

-- Users can view members of groups they belong to
CREATE POLICY "Users can view family group members" ON family_group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_groups 
      WHERE id = family_group_id AND (
        admin_user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM family_group_members WHERE family_group_id = id AND user_id = auth.uid())
      )
    )
  );

-- Users can join a family group
CREATE POLICY "Users can insert family group members" ON family_group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own membership settings
CREATE POLICY "Users can update own family group membership" ON family_group_members
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins and users themselves can remove memberships
CREATE POLICY "Users can delete family group members" ON family_group_members
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM family_groups 
      WHERE id = family_group_id AND admin_user_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 13: CREATE INDEXES FOR BETTER PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_weight_entries_user_date ON weight_entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_calorie_entries_user_date ON calorie_entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_wellness_entries_user_date ON wellness_entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_date ON mood_entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_progress_photos_user_date ON progress_photos(user_id, photo_date DESC);
CREATE INDEX IF NOT EXISTS idx_family_group_members_group ON family_group_members(family_group_id);
CREATE INDEX IF NOT EXISTS idx_family_group_members_user ON family_group_members(user_id);

-- ============================================================================
-- STEP 14: CREATE STORAGE BUCKET FOR PROGRESS PHOTOS
-- ============================================================================
-- Note: This must be run in the Supabase dashboard Storage section, not SQL editor
-- Or use the Supabase CLI/Management API
--
-- Bucket name: progress-photos
-- Public: false (users access via signed URLs)
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp
-- 
-- You'll need to create this bucket manually in Supabase Dashboard > Storage
-- Then apply the storage policies below via SQL

-- ============================================================================
-- STEP 15: CREATE STORAGE POLICIES FOR PROGRESS PHOTOS BUCKET
-- ============================================================================

-- After creating the 'progress-photos' bucket in the Supabase dashboard, run these:

-- Users can upload their own photos
INSERT INTO storage.policies (name, bucket_id, definition, operation)
VALUES (
  'Users can upload own photos',
  'progress-photos',
  '(bucket_id = ''progress-photos''::text) AND (auth.uid()::text = (storage.foldername(name))[1])',
  'INSERT'
) ON CONFLICT DO NOTHING;

-- Users can view their own photos
INSERT INTO storage.policies (name, bucket_id, definition, operation)
VALUES (
  'Users can view own photos',
  'progress-photos',
  '(bucket_id = ''progress-photos''::text) AND (auth.uid()::text = (storage.foldername(name))[1])',
  'SELECT'
) ON CONFLICT DO NOTHING;

-- Users can delete their own photos
INSERT INTO storage.policies (name, bucket_id, definition, operation)
VALUES (
  'Users can delete own photos',
  'progress-photos',
  '(bucket_id = ''progress-photos''::text) AND (auth.uid()::text = (storage.foldername(name))[1])',
  'DELETE'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 16: CREATE FUNCTION TO CLEAN UP OLD SOFT-DELETED ENTRIES
-- ============================================================================
-- This function can be run manually or scheduled to permanently delete
-- entries that were soft-deleted more than 30 days ago

CREATE OR REPLACE FUNCTION cleanup_deleted_entries()
RETURNS void AS $$
BEGIN
  DELETE FROM weight_entries WHERE deleted_at < NOW() - INTERVAL '30 days';
  DELETE FROM calorie_entries WHERE deleted_at < NOW() - INTERVAL '30 days';
  DELETE FROM wellness_entries WHERE deleted_at < NOW() - INTERVAL '30 days';
  DELETE FROM mood_entries WHERE deleted_at < NOW() - INTERVAL '30 days';
  DELETE FROM progress_photos WHERE deleted_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 17: CREATE FUNCTION TO GENERATE UNIQUE INVITE CODES
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Avoid confusing chars
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SETUP COMPLETE! 
-- ============================================================================
-- Next steps:
-- 1. Create the 'progress-photos' storage bucket in Supabase Dashboard > Storage
-- 2. Set bucket to private with 5MB file size limit
-- 3. Allow MIME types: image/jpeg, image/png, image/webp
-- 4. The storage policies above will be applied automatically
-- 5. Update your .env file with your Supabase credentials
-- 6. Deploy your updated FitFlow v2.0 app!
-- ============================================================================
