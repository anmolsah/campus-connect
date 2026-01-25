/*
  # Campus Connect - Initial Schema Setup
  
  This migration creates the complete database schema for the Campus Connect MVP.
  
  ## 1. New Tables
  
  ### profiles
  - `id` (uuid, primary key) - References auth.users
  - `email` (text, unique) - User's .edu email
  - `full_name` (text) - User's display name
  - `avatar_url` (text) - Profile photo URL
  - `college_name` (text) - College/university name
  - `major` (text) - Field of study
  - `graduation_year` (integer) - Expected graduation year
  - `bio` (text) - Short biography
  - `id_card_url` (text) - Uploaded ID card for verification
  - `is_verified` (boolean) - Verification status
  - `current_mode` (text) - Active mode: study/social/project
  - `last_active` (timestamptz) - Last activity timestamp
  - `onboarding_completed` (boolean) - Whether user completed onboarding
  - `created_at`, `updated_at` (timestamptz) - Timestamps
  
  ### user_interests
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References profiles
  - `interest` (text) - Interest name
  - `category` (text) - hobby/skill/academic/activity
  
  ### connections
  - `id` (uuid, primary key)
  - `requester_id` (uuid) - User sending request
  - `receiver_id` (uuid) - User receiving request
  - `status` (text) - pending/accepted/rejected
  - `request_message` (text) - Optional message with request
  - `mode_context` (text) - Mode when request was sent
  
  ### messages
  - `id` (uuid, primary key)
  - `connection_id` (uuid) - References connections
  - `sender_id` (uuid) - Message sender
  - `content` (text) - Message content
  - `message_type` (text) - text/emoji
  - `is_read` (boolean) - Read status
  
  ### posts
  - `id` (uuid, primary key)
  - `author_id` (uuid) - Post creator
  - `post_type` (text) - thought/photo/project/event/resource/question
  - `mode_context` (text) - study/social/project
  - `content` (text) - Main text content
  - `image_url` (text) - Optional image
  - Various type-specific fields for projects, events, resources, questions
  - `moderation_status` (text) - pending/approved/rejected/flagged
  - `likes_count`, `comments_count` (integer) - Denormalized counters
  
  ### post_comments
  - `id` (uuid, primary key)
  - `post_id` (uuid) - Parent post
  - `author_id` (uuid) - Comment author
  - `parent_comment_id` (uuid) - For threaded replies
  - `content` (text) - Comment text
  - `is_best_answer` (boolean) - For question posts
  
  ### post_likes
  - `id` (uuid, primary key)
  - `post_id` (uuid) - Liked post
  - `user_id` (uuid) - User who liked
  
  ### saved_posts
  - `id` (uuid, primary key)
  - `post_id` (uuid) - Saved post
  - `user_id` (uuid) - User who saved
  
  ### content_reports
  - `id` (uuid, primary key)
  - `reporter_id` (uuid) - User reporting
  - `post_id` or `comment_id` (uuid) - Reported content
  - `reason` (text) - Report reason
  - `status` (text) - Review status
  
  ### user_violations
  - `id` (uuid, primary key)
  - `user_id` (uuid) - Violating user
  - `violation_type` (text) - Type of violation
  - `action_taken` (text) - Action taken
  
  ## 2. Security
  - Enable RLS on all tables
  - Policies for authenticated access
  - Owner-only policies for sensitive data
  
  ## 3. Performance
  - Indexes on frequently queried columns
  - Triggers for denormalized counters
*/

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  college_name TEXT,
  major TEXT,
  graduation_year INTEGER,
  bio TEXT DEFAULT '',
  id_card_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  current_mode TEXT DEFAULT 'social' CHECK (current_mode IN ('study', 'social', 'project')),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- USER INTERESTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_interests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  interest TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hobby', 'skill', 'academic', 'activity')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, interest)
);

-- =============================================
-- CONNECTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  request_message TEXT DEFAULT '',
  mode_context TEXT NOT NULL CHECK (mode_context IN ('study', 'social', 'project')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, receiver_id),
  CONSTRAINT different_users CHECK (requester_id != receiver_id)
);

-- =============================================
-- MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID REFERENCES public.connections(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'emoji')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- POSTS TABLE (SOCIAL FEED)
-- =============================================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('thought', 'photo', 'project', 'event', 'resource', 'question')),
  mode_context TEXT NOT NULL CHECK (mode_context IN ('study', 'social', 'project')),
  content TEXT,
  image_url TEXT,
  project_title TEXT,
  project_links TEXT[],
  roles_needed TEXT[],
  event_title TEXT,
  event_date TIMESTAMPTZ,
  event_location TEXT,
  event_rsvp_link TEXT,
  resource_title TEXT,
  resource_link TEXT,
  resource_tags TEXT[],
  best_answer_id UUID,
  moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
  moderation_reason TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- POST COMMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_best_answer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- POST LIKES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- =============================================
-- SAVED POSTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.saved_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- =============================================
-- CONTENT REPORTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.content_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'harassment', 'violence', 'misinformation', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  CONSTRAINT report_target CHECK (post_id IS NOT NULL OR comment_id IS NOT NULL)
);

-- =============================================
-- USER VIOLATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_violations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  violation_type TEXT NOT NULL CHECK (violation_type IN ('content_policy', 'harassment', 'spam', 'inappropriate_content')),
  description TEXT,
  action_taken TEXT NOT NULL CHECK (action_taken IN ('warning', 'post_removed', 'suspension_24h', 'suspension_7d', 'permanent_ban')),
  related_post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_profiles_mode ON public.profiles(current_mode);
CREATE INDEX IF NOT EXISTS idx_profiles_college ON public.profiles(college_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON public.profiles(is_verified);

CREATE INDEX IF NOT EXISTS idx_connections_requester ON public.connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver ON public.connections(receiver_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON public.connections(status);

CREATE INDEX IF NOT EXISTS idx_messages_connection ON public.messages(connection_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_type ON public.posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_mode ON public.posts(mode_context);
CREATE INDEX IF NOT EXISTS idx_posts_moderation ON public.posts(moderation_status);
CREATE INDEX IF NOT EXISTS idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_likes ON public.posts(likes_count DESC);

CREATE INDEX IF NOT EXISTS idx_comments_post ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON public.post_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON public.post_comments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_likes_post ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_user ON public.saved_posts(user_id);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.content_reports(status);
CREATE INDEX IF NOT EXISTS idx_violations_user ON public.user_violations(user_id);
CREATE INDEX IF NOT EXISTS idx_interests_user ON public.user_interests(user_id);

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_connections_updated_at ON public.connections;
CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON public.post_comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- LIKES COUNTER TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_likes_count ON public.post_likes;
CREATE TRIGGER trigger_update_likes_count
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- =============================================
-- COMMENTS COUNTER TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_comments_count ON public.post_comments;
CREATE TRIGGER trigger_update_comments_count
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_violations ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES POLICIES
-- =============================================
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- =============================================
-- USER INTERESTS POLICIES
-- =============================================
DROP POLICY IF EXISTS "Interests viewable by authenticated users" ON public.user_interests;
CREATE POLICY "Interests viewable by authenticated users"
  ON public.user_interests FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert own interests" ON public.user_interests;
CREATE POLICY "Users can insert own interests"
  ON public.user_interests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own interests" ON public.user_interests;
CREATE POLICY "Users can delete own interests"
  ON public.user_interests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- CONNECTIONS POLICIES
-- =============================================
DROP POLICY IF EXISTS "Users can view own connections" ON public.connections;
CREATE POLICY "Users can view own connections"
  ON public.connections FOR SELECT
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send connection requests" ON public.connections;
CREATE POLICY "Users can send connection requests"
  ON public.connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Receivers can update connection status" ON public.connections;
CREATE POLICY "Receivers can update connection status"
  ON public.connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- =============================================
-- MESSAGES POLICIES
-- =============================================
DROP POLICY IF EXISTS "Users can view messages in their connections" ON public.messages;
CREATE POLICY "Users can view messages in their connections"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.connections
      WHERE connections.id = messages.connection_id
      AND connections.status = 'accepted'
      AND (connections.requester_id = auth.uid() OR connections.receiver_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can send messages in accepted connections" ON public.messages;
CREATE POLICY "Users can send messages in accepted connections"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.connections
      WHERE connections.id = connection_id
      AND connections.status = 'accepted'
      AND (connections.requester_id = auth.uid() OR connections.receiver_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
CREATE POLICY "Users can update own messages"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.connections
      WHERE connections.id = messages.connection_id
      AND (connections.requester_id = auth.uid() OR connections.receiver_id = auth.uid())
    )
  );

-- =============================================
-- POSTS POLICIES
-- =============================================
DROP POLICY IF EXISTS "Approved posts viewable by authenticated users" ON public.posts;
CREATE POLICY "Approved posts viewable by authenticated users"
  ON public.posts FOR SELECT
  TO authenticated
  USING (moderation_status = 'approved' OR author_id = auth.uid());

DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
CREATE POLICY "Users can create posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
CREATE POLICY "Users can update own posts"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- =============================================
-- POST COMMENTS POLICIES
-- =============================================
DROP POLICY IF EXISTS "Comments viewable by authenticated users" ON public.post_comments;
CREATE POLICY "Comments viewable by authenticated users"
  ON public.post_comments FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can create comments" ON public.post_comments;
CREATE POLICY "Users can create comments"
  ON public.post_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update own comments" ON public.post_comments;
CREATE POLICY "Users can update own comments"
  ON public.post_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.post_comments;
CREATE POLICY "Users can delete own comments"
  ON public.post_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- =============================================
-- POST LIKES POLICIES
-- =============================================
DROP POLICY IF EXISTS "Likes viewable by authenticated users" ON public.post_likes;
CREATE POLICY "Likes viewable by authenticated users"
  ON public.post_likes FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can like posts" ON public.post_likes;
CREATE POLICY "Users can like posts"
  ON public.post_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove own likes" ON public.post_likes;
CREATE POLICY "Users can remove own likes"
  ON public.post_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- SAVED POSTS POLICIES
-- =============================================
DROP POLICY IF EXISTS "Users can view own saved posts" ON public.saved_posts;
CREATE POLICY "Users can view own saved posts"
  ON public.saved_posts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can save posts" ON public.saved_posts;
CREATE POLICY "Users can save posts"
  ON public.saved_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unsave posts" ON public.saved_posts;
CREATE POLICY "Users can unsave posts"
  ON public.saved_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- CONTENT REPORTS POLICIES
-- =============================================
DROP POLICY IF EXISTS "Users can view own reports" ON public.content_reports;
CREATE POLICY "Users can view own reports"
  ON public.content_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can create reports" ON public.content_reports;
CREATE POLICY "Users can create reports"
  ON public.content_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- =============================================
-- USER VIOLATIONS POLICIES
-- =============================================
DROP POLICY IF EXISTS "Users can view own violations" ON public.user_violations;
CREATE POLICY "Users can view own violations"
  ON public.user_violations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
