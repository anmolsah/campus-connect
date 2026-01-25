/*
  # Storage Buckets Setup
  
  Creates storage buckets for Campus Connect file uploads:
  
  ## 1. Buckets Created
  
  ### id-cards (private)
  - Stores user ID card images for verification
  - Only accessible by the owner
  - Max file size: 5MB
  
  ### avatars (public)
  - Stores user profile photos
  - Publicly readable for display
  - Only owner can upload/modify
  - Max file size: 2MB
  
  ### post-images (public)
  - Stores images attached to posts
  - Publicly readable for display
  - Only authenticated users can upload
  - Max file size: 5MB
  
  ## 2. Security
  - RLS policies for each bucket
  - Owner-only write access
  - Public read for avatars and post-images
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('id-cards', 'id-cards', false, 5242880)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('avatars', 'avatars', true, 2097152)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('post-images', 'post-images', true, 5242880)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- ID CARDS STORAGE POLICIES
-- =============================================
DROP POLICY IF EXISTS "Users can upload own ID card" ON storage.objects;
CREATE POLICY "Users can upload own ID card"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'id-cards'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can view own ID card" ON storage.objects;
CREATE POLICY "Users can view own ID card"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'id-cards'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update own ID card" ON storage.objects;
CREATE POLICY "Users can update own ID card"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'id-cards'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own ID card" ON storage.objects;
CREATE POLICY "Users can delete own ID card"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'id-cards'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- =============================================
-- AVATARS STORAGE POLICIES
-- =============================================
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- =============================================
-- POST IMAGES STORAGE POLICIES
-- =============================================
DROP POLICY IF EXISTS "Post images are publicly accessible" ON storage.objects;
CREATE POLICY "Post images are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'post-images');

DROP POLICY IF EXISTS "Users can upload post images" ON storage.objects;
CREATE POLICY "Users can upload post images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'post-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own post images" ON storage.objects;
CREATE POLICY "Users can delete own post images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'post-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
