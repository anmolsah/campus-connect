-- User Interests Table
CREATE TABLE IF NOT EXISTS public.user_interests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  interest TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hobby', 'skill', 'academic', 'activity')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, interest)
);

-- Connections Table
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

-- Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID REFERENCES public.connections(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'emoji')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts Table
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
);;
