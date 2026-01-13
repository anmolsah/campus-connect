<p align="center">
  <img src="https://img.shields.io/badge/Phase%201-Genesis%2050-FF6B6B?style=for-the-badge" alt="Phase 1"/>
</p>

<h1 align="center">🚀 Campus Connect - Phase 1 MVP</h1>

<p align="center">
  <strong>The "Genesis 50" Launch</strong><br/>
  <sub>First 50 verified users • Single campus deployment • Core feature validation</sub>
</p>

---

## 📋 Table of Contents

- [Executive Summary](#-executive-summary)
- [MVP Scope](#-mvp-scope)
- [User Journey](#-user-journey)
- [Technical Implementation](#-technical-implementation)
- [Database Design](#-database-design)
- [API Endpoints](#-api-endpoints)
- [UI/UX Specifications](#-uiux-specifications)
- [Security Measures](#-security-measures)
- [Testing Strategy](#-testing-strategy)
- [Launch Checklist](#-launch-checklist)
- [Success Metrics](#-success-metrics)
- [Known Limitations](#-known-limitations)

---

## 📊 Executive Summary

### What is Phase 1?

Phase 1, codenamed **"Genesis 50"**, is the Minimum Viable Product (MVP) launch of Campus Connect. The goal is to validate our core hypothesis:

> **"Verified, intent-based campus networking creates more meaningful connections than traditional social apps."**

### Target Metrics

| Metric                     | Target  | Timeline |
| -------------------------- | ------- | -------- |
| Verified Users             | 50      | 4 weeks  |
| Daily Active Users (DAU)   | 30+     | Week 4   |
| Connection Acceptance Rate | >60%    | Ongoing  |
| Messages per Active User   | 10+/day | Week 4   |
| User Retention (7-day)     | >40%    | Week 4   |

### Deployment Target

- **Campus**: Single partner college (pilot)
- **Domain Verification**: Only `@partnercollege.edu` emails accepted
- **Geography**: Campus-only discovery (no cross-campus)

---

## 🎯 MVP Scope

### ✅ In Scope (Must Have)

| Feature                 | Priority | Description                                 |
| ----------------------- | -------- | ------------------------------------------- |
| **Email Verification**  | P0       | .edu email entry gate with OTP              |
| **Basic Profile**       | P0       | Name, photo, college info, bio              |
| **ID Card Upload**      | P0       | Upload for accountability (no admin review) |
| **Triple Mode Toggle**  | P0       | Study / Social / Project modes              |
| **Discovery Feed**      | P0       | Browse verified users in same mode          |
| **Social Feed & Posts** | P0       | Share thoughts, photos, projects, events    |
| **Content Moderation**  | P0       | AI-powered image scanning (no vulgarity)    |
| **Connection System**   | P0       | Send/Accept/Reject requests                 |
| **Basic Chat**          | P0       | Text + emoji messaging                      |
| **Realtime Updates**    | P0       | Instant message delivery                    |

### ⏳ Deferred to Phase 2

| Feature                | Reason                          |
| ---------------------- | ------------------------------- |
| Cross-campus discovery | Validate single-campus UX first |
| Sticker packs          | Nice-to-have, not core          |
| File sharing in chat   | Adds complexity                 |
| AI Smart Matching      | Requires user data baseline     |
| Push notifications     | Can use email for MVP           |
| Admin dashboard        | Manual SQL for MVP              |

### ❌ Not in Scope

- Anonymous profiles
- Group chats
- Video/voice calls
- Integration with university systems
- Payment processing

---

## 🗺️ User Journey

### Complete Flow Diagram

```
┌───────────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY - PHASE 1                         │
└───────────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │   Landing   │
                              │    Page     │
                              └──────┬──────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │   Enter .edu Email    │
                         │  (domain validation)  │
                         └───────────┬───────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
        ┌───────────┐         ┌───────────┐          ┌───────────┐
        │  Invalid  │         │  Valid    │          │  Already  │
        │  Domain   │         │  Domain   │          │Registered │
        └───────────┘         └─────┬─────┘          └─────┬─────┘
              │                     │                      │
              ▼                     ▼                      ▼
        [Show Error]         [Send OTP Email]        [Go to Login]
                                    │
                                    ▼
                         ┌───────────────────────┐
                         │   Enter 6-Digit OTP   │
                         │   (3 attempts max)    │
                         └───────────┬───────────┘
                                     │
                      ┌──────────────┴──────────────┐
                      ▼                             ▼
               [OTP Valid]                   [OTP Invalid]
                      │                             │
                      ▼                             ▼
         ┌────────────────────────┐         [Show Retry Option]
         │    Create Password     │
         │    (min 8 chars)       │
         └───────────┬────────────┘
                     │
                     ▼
         ┌────────────────────────┐
         │   ONBOARDING FLOW     │
         ├────────────────────────┤
         │  1. Upload ID Card     │
         │  2. Enter Name         │
         │  3. Select College     │
         │  4. Enter Major        │
         │  5. Write Bio          │
         │  6. Upload Avatar      │
         │  7. Select Mode        │
         └───────────┬────────────┘
                     │
                     ▼
         ┌────────────────────────┐
         │    ✅ VERIFIED USER    │
         │   Badge: Identity      │
         │       Verified         │
         └───────────┬────────────┘
                     │
                     ▼
         ╔════════════════════════╗
         ║    MAIN APPLICATION    ║
         ╠════════════════════════╣
         ║                        ║
         ║   ┌──────────────┐    ║
         ║   │  Discovery   │    ║
         ║   │    Feed      │◄───╬───── Browse users in same mode
         ║   └──────────────┘    ║
         ║          │            ║
         ║          ▼            ║
         ║   ┌──────────────┐    ║
         ║   │   Profile    │    ║
         ║   │    Card      │◄───╬───── View user details
         ║   └──────────────┘    ║
         ║          │            ║
         ║          ▼            ║
         ║   ┌──────────────┐    ║
         ║   │   Connect    │    ║
         ║   │   Request    │◄───╬───── Send connection
         ║   └──────────────┘    ║
         ║          │            ║
         ║          ▼            ║
         ║   [Wait for Accept]   ║
         ║          │            ║
         ║          ▼            ║
         ║   ┌──────────────┐    ║
         ║   │    Chat      │    ║
         ║   │   Unlocked   │◄───╬───── Realtime messaging
         ║   └──────────────┘    ║
         ║                        ║
         ╚════════════════════════╝
```

### Step-by-Step Journey

#### 1️⃣ Landing & Email Entry

**Screen**: Landing Page
**Actions**:

- User enters their college email address
- System validates email domain against allowed list
- Invalid domain → Error message with supported colleges
- Valid domain → Proceed to OTP

**Validation Rules**:

```javascript
const ALLOWED_DOMAINS = ["partnercollege.edu"]; // Phase 1: Single campus

const validateEmail = (email) => {
  const domain = email.split("@")[1];
  return ALLOWED_DOMAINS.includes(domain);
};
```

#### 2️⃣ OTP Verification

**Screen**: OTP Input
**Actions**:

- 6-digit OTP sent via Brevo SMTP
- OTP valid for 10 minutes
- Max 3 attempts before cooldown (5 minutes)
- Resend option after 60 seconds

**Email Template**:

```html
Subject: Your Campus Connect Verification Code Hey there! 👋 Your verification
code is: {{OTP_CODE}} This code expires in 10 minutes. If you didn't request
this code, please ignore this email. — Campus Connect Team
```

#### 3️⃣ Password Creation

**Screen**: Password Setup
**Requirements**:

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- Password strength indicator
- Confirm password field

#### 4️⃣ Onboarding Profile Setup

**Screen**: Multi-step Onboarding (7 steps)

| Step | Field            | Required | Validation                           |
| ---- | ---------------- | -------- | ------------------------------------ |
| 1    | ID Card Upload   | ✅       | Image file (jpg, png, webp), max 5MB |
| 2    | Full Name        | ✅       | 2-50 characters                      |
| 3    | College          | ✅       | Dropdown (pre-populated for pilot)   |
| 4    | Major/Department | ✅       | Dropdown + Other option              |
| 5    | Bio              | ❌       | 0-300 characters                     |
| 6    | Avatar Photo     | ❌       | Image file, max 2MB                  |
| 7    | Starting Mode    | ✅       | Study / Social / Project             |

#### 5️⃣ Discovery & Browsing

**Screen**: Discovery Feed
**Features**:

- Card-based UI showing verified users
- Filter by current mode (shown at top)
- User cards show: Avatar, Name, Major, Short Bio
- Tap card → Expanded profile view
- "Connect" button on each card

**Sorting Algorithm (MVP)**:

```javascript
// Simple sorting for MVP - recently active first
const sortUsers = (users) => {
  return users.sort(
    (a, b) => new Date(b.last_active) - new Date(a.last_active)
  );
};
```

#### 6️⃣ Connection Flow

**Screen**: Connection Management
**States**:

| State    | Requester View   | Receiver View      |
| -------- | ---------------- | ------------------ |
| Pending  | "Request Sent ✓" | "Accept / Decline" |
| Accepted | "Chat Now →"     | "Chat Now →"       |
| Rejected | Hidden from feed | Hidden from feed   |

**Connection Request Content**:

- Auto-generated: "Hey! I'd like to connect in [MODE] mode"
- Optional: Custom message (max 100 chars)

#### 7️⃣ Chat Interface

**Screen**: Chat Room
**Features**:

- Real-time messaging via Supabase Realtime
- Text input with emoji picker
- Message bubbles (sent right, received left)
- Timestamps (relative: "2m ago", "Yesterday")
- Online status indicator
- Typing indicator

#### 8️⃣ Social Feed & Posts

**Screen**: Campus Feed
**Purpose**: A social timeline where verified students can share content with the campus community.

```
┌────────────────────────────────────────────────────────────────┐
│                      CAMPUS FEED                               │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  ➕ CREATE POST                                          │ │
│  │  ┌────────┬────────┬────────┬────────┬────────┬───────┐  │ │
│  │  │💭      │📸      │🚀      │📅      │📚      │❓     │  │ │
│  │  │Thought │Photo   │Project │Event   │Resource│Question  │ │
│  │  └────────┴────────┴────────┴────────┴────────┴───────┘  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  [Avatar] Sarah Johnson • 2h ago               📖 Study  │ │
│  │  ──────────────────────────────────────────────────────  │ │
│  │  💭 "Looking for study partners for the upcoming        │ │
│  │     finals! CS 301 study group anyone? 📚"              │ │
│  │                                                          │ │
│  │  ❤️ 12   💬 5 Comments   🔖 Save   🔗 Share             │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  [Avatar] Alex Chen • 5h ago                   🤝 Social │ │
│  │  ──────────────────────────────────────────────────────  │ │
│  │  📸 [Photo: Campus sunset view]                         │ │
│  │  "Perfect evening at the quad! 🌅"                      │ │
│  │                                                          │ │
│  │  ❤️ 45   💬 12 Comments   🔖 Save   🔗 Share            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  [Avatar] Jordan Lee • 1d ago                 🚀 Project │ │
│  │  ──────────────────────────────────────────────────────  │ │
│  │  🚀 PROJECT: EcoTrack - Campus Sustainability App       │ │
│  │  "Looking for a UI/UX designer to join our hackathon    │ │
│  │   team! We're building something awesome 🌱"            │ │
│  │  🔗 [View Project Details]                              │ │
│  │                                                          │ │
│  │  ❤️ 28   💬 8 Comments   🔖 Save   🔗 Share             │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

##### Post Types (MVP)

| Type         | Icon | Description                                    | Fields                                          |
| ------------ | ---- | ---------------------------------------------- | ----------------------------------------------- |
| **Thought**  | 💭   | Text-based posts, opinions, campus experiences | Text (500 chars max), optional image            |
| **Photo**    | 📸   | Share campus life, memories, achievements      | Image (required), caption (300 chars)           |
| **Project**  | 🚀   | Showcase work, find team members               | Title, description, links, roles needed         |
| **Event**    | 📅   | Promote events, meetups, activities            | Title, date/time, location, RSVP link           |
| **Resource** | 📚   | Share study materials, helpful links           | Title, description, external link, subject tags |
| **Question** | ❓   | Ask the community for help                     | Question text, category, accept best answer     |

##### Content Moderation System

**Image Upload Flow**:

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User      │     │   AI Content    │     │    Decision     │
│  Uploads    │────►│   Moderation    │────►│                 │
│   Image     │     │   (NSFW Check)  │     │                 │
└─────────────┘     └─────────────────┘     └────────┬────────┘
                                                     │
                           ┌─────────────────────────┼─────────────────────────┐
                           │                         │                         │
                           ▼                         ▼                         ▼
                    ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
                    │   ✅ SAFE   │          │ ⚠️ REVIEW   │          │  ❌ BLOCKED │
                    │  Published  │          │   Pending   │          │  Rejected   │
                    └─────────────┘          └─────────────┘          └─────────────┘
```

**Moderation Rules**:

- 🛡️ **AI-Powered Scanning**: Using image classification API to detect inappropriate content
- 🚫 **Blocked Content**: Nudity, violence, explicit material, hate symbols
- ⚠️ **Review Queue**: Edge cases flagged for manual review
- 📢 **Community Reports**: Users can report inappropriate posts
- ⚖️ **Violation Policy**:
  - 1st offense: Warning + post removed
  - 2nd offense: 24-hour account suspension
  - 3rd offense: 7-day suspension
  - 4th offense: Permanent ban

##### Feed Filters

| Filter             | Description                               |
| ------------------ | ----------------------------------------- |
| **All Posts**      | Everything from campus                    |
| **By Mode**        | Filter by Study/Social/Project            |
| **By Type**        | Filter by Thoughts/Photos/Projects/Events |
| **Following Only** | Only from connected users                 |
| **Trending**       | Most engaged posts this week              |

##### Engagement Features

- ❤️ **Likes**: Quick appreciation (tap to like/unlike)
- 💬 **Comments**: Threaded discussions on posts
- 🔖 **Save**: Bookmark posts to view later
- 🔗 **Share**: Share to connections or copy link
- 🔔 **Notifications**: Get notified of likes/comments on your posts

---

## 🔧 Technical Implementation

### Frontend Stack

```
┌──────────────────────────────────────────────────────────┐
│                    FRONTEND STRUCTURE                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  React 18 (Vite)                                        │
│  ├── TypeScript (strict mode)                           │
│  ├── Tailwind CSS                                       │
│  │   ├── Custom design tokens                           │
│  │   └── Responsive breakpoints                         │
│  ├── React Router v6                                    │
│  │   ├── Protected routes                               │
│  │   └── Lazy loading                                   │
│  ├── React Query (TanStack)                             │
│  │   ├── Caching                                        │
│  │   └── Optimistic updates                             │
│  └── Supabase JS Client                                 │
│      ├── Auth                                           │
│      ├── Database                                       │
│      ├── Realtime                                       │
│      └── Storage                                        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Key Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@supabase/supabase-js": "^2.39.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "lucide-react": "^0.294.0",
    "date-fns": "^3.0.0",
    "emoji-picker-react": "^4.5.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "@types/react": "^18.2.0",
    "vite": "^5.0.0"
  }
}
```

### Supabase Configuration

#### Authentication Setup

```javascript
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);
```

#### Brevo SMTP Configuration (Supabase Dashboard)

```
SMTP Host: smtp-relay.brevo.com
SMTP Port: 587
SMTP User: your-brevo-email@domain.com
SMTP Password: your-brevo-api-key
Sender Email: noreply@campusconnect.dev
Sender Name: Campus Connect
```

### State Management

Using **Zustand** for lightweight global state:

```typescript
// stores/userStore.ts
import { create } from "zustand";

interface UserState {
  user: User | null;
  currentMode: "study" | "social" | "project";
  setUser: (user: User) => void;
  setMode: (mode: "study" | "social" | "project") => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  currentMode: "social",
  setUser: (user) => set({ user }),
  setMode: (currentMode) => set({ currentMode }),
  logout: () => set({ user: null, currentMode: "social" }),
}));
```

### Realtime Chat Implementation

```typescript
// hooks/useChat.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const useChat = (connectionId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Fetch existing messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("connection_id", connectionId)
        .order("created_at", { ascending: true });

      setMessages(data || []);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat:${connectionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `connection_id=eq.${connectionId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [connectionId]);

  const sendMessage = async (content: string) => {
    const { error } = await supabase.from("messages").insert({
      connection_id: connectionId,
      sender_id: (await supabase.auth.getUser()).data.user?.id,
      content,
      message_type: "text",
    });

    if (error) throw error;
  };

  return { messages, sendMessage };
};
```

---

## 🗄️ Database Design

### Complete Schema (Phase 1)

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  college_name TEXT NOT NULL,
  major TEXT NOT NULL,
  graduation_year INTEGER,
  bio TEXT DEFAULT '',
  id_card_url TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT TRUE, -- Auto-verified on OTP success
  current_mode TEXT DEFAULT 'social' CHECK (current_mode IN ('study', 'social', 'project')),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- USER INTERESTS TABLE
-- =============================================
CREATE TABLE public.user_interests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  interest TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hobby', 'skill', 'academic', 'activity')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, interest)
);

-- =============================================
-- CONNECTIONS TABLE
-- =============================================
CREATE TABLE public.connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  connection_id UUID REFERENCES public.connections(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'emoji')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_profiles_mode ON public.profiles(current_mode);
CREATE INDEX idx_profiles_college ON public.profiles(college_name);
CREATE INDEX idx_profiles_last_active ON public.profiles(last_active DESC);
CREATE INDEX idx_connections_requester ON public.connections(requester_id);
CREATE INDEX idx_connections_receiver ON public.connections(receiver_id);
CREATE INDEX idx_connections_status ON public.connections(status);
CREATE INDEX idx_messages_connection ON public.messages(connection_id);
CREATE INDEX idx_messages_created ON public.messages(created_at DESC);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Row Level Security Policies

```sql
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES POLICIES
-- =============================================

-- Anyone authenticated can view verified profiles
CREATE POLICY "Verified profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated' AND is_verified = true);

-- Users can update only their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================
-- USER INTERESTS POLICIES
-- =============================================

-- Interests visible for verified users
CREATE POLICY "Interests viewable for verified users"
  ON public.user_interests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = user_interests.user_id
      AND profiles.is_verified = true
    )
  );

-- Users can manage their own interests
CREATE POLICY "Users can manage own interests"
  ON public.user_interests FOR ALL
  USING (auth.uid() = user_id);

-- =============================================
-- CONNECTIONS POLICIES
-- =============================================

-- Users can view connections they're part of
CREATE POLICY "Users can view own connections"
  ON public.connections FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Users can create connection requests
CREATE POLICY "Users can send connection requests"
  ON public.connections FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Users can update connections they received (accept/reject)
CREATE POLICY "Receivers can update connection status"
  ON public.connections FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- =============================================
-- MESSAGES POLICIES
-- =============================================

-- Users can view messages in accepted connections
CREATE POLICY "Users can view messages in accepted connections"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.connections
      WHERE connections.id = messages.connection_id
      AND connections.status = 'accepted'
      AND (connections.requester_id = auth.uid() OR connections.receiver_id = auth.uid())
    )
  );

-- Users can send messages in accepted connections
CREATE POLICY "Users can send messages in accepted connections"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.connections
      WHERE connections.id = messages.connection_id
      AND connections.status = 'accepted'
      AND (connections.requester_id = auth.uid() OR connections.receiver_id = auth.uid())
    )
  );
```

### Storage Buckets Setup

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('id-cards', 'id-cards', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- ID Cards policy (private - only owner can access)
CREATE POLICY "Users can upload own ID card"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'id-cards'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own ID card"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'id-cards'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Avatars policy (public readable, owner writable)
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint               | Description                    |
| ------ | ---------------------- | ------------------------------ |
| POST   | `/auth/signup`         | Register with email + password |
| POST   | `/auth/verify-otp`     | Verify email OTP               |
| POST   | `/auth/login`          | Login with email + password    |
| POST   | `/auth/logout`         | End session                    |
| POST   | `/auth/reset-password` | Request password reset         |

### Profiles

| Method | Endpoint             | Description                 |
| ------ | -------------------- | --------------------------- |
| GET    | `/profiles/me`       | Get current user profile    |
| PATCH  | `/profiles/me`       | Update current user profile |
| GET    | `/profiles/:id`      | Get public profile by ID    |
| GET    | `/profiles/discover` | Get discovery feed          |

### Connections

| Method | Endpoint               | Description                |
| ------ | ---------------------- | -------------------------- |
| POST   | `/connections`         | Send connection request    |
| GET    | `/connections`         | Get all user's connections |
| PATCH  | `/connections/:id`     | Accept/Reject connection   |
| GET    | `/connections/pending` | Get pending requests       |

### Messages

| Method | Endpoint                  | Description      |
| ------ | ------------------------- | ---------------- |
| GET    | `/messages/:connectionId` | Get chat history |
| POST   | `/messages/:connectionId` | Send message     |
| PATCH  | `/messages/:id/read`      | Mark as read     |

> **Note**: All endpoints are accessed through Supabase client library, not traditional REST calls. The table above represents the conceptual API structure.

---

## 🎨 UI/UX Specifications

### Design System

#### Color Palette

```css
:root {
  /* Primary */
  --color-primary-50: #f5f3ff;
  --color-primary-100: #ede9fe;
  --color-primary-500: #8b5cf6;
  --color-primary-600: #7c3aed;
  --color-primary-700: #6d28d9;

  /* Secondary (Study Mode) */
  --color-study: #3b82f6;

  /* Secondary (Social Mode) */
  --color-social: #10b981;

  /* Secondary (Project Mode) */
  --color-project: #f59e0b;

  /* Neutrals */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-500: #6b7280;
  --color-gray-900: #111827;

  /* Semantic */
  --color-success: #10b981;
  --color-error: #ef4444;
  --color-warning: #f59e0b;
}
```

#### Typography

```css
/* Font Family */
font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;

/* Font Sizes */
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */
```

#### Component Specifications

##### Mode Toggle Button

```jsx
// Three-way toggle showing current mode
<ModeToggle>
  <ModeButton active={mode === "study"} color="blue">
    📖 Study
  </ModeButton>
  <ModeButton active={mode === "social"} color="green">
    🤝 Social
  </ModeButton>
  <ModeButton active={mode === "project"} color="amber">
    🚀 Project
  </ModeButton>
</ModeToggle>
```

##### User Discovery Card

```
┌────────────────────────────────────────┐
│  ┌────────┐                            │
│  │ Avatar │  Sarah Johnson             │
│  │  80x80 │  Computer Science '25      │
│  └────────┘  📍 Same Campus            │
│                                        │
│  "Looking for study partners for       │
│   CS 301 - Data Structures"            │
│                                        │
│  ┌──────────┐  ┌──────────────────┐   │
│  │ View     │  │    Connect ✓     │   │
│  │ Profile  │  │                  │   │
│  └──────────┘  └──────────────────┘   │
└────────────────────────────────────────┘
```

##### Chat Message Bubble

```
Sent (Right aligned):
                    ┌───────────────────────┐
                    │ Hey! Want to study    │
                    │ together tomorrow?    │
                    └───────────────────────┘
                                   ✓✓ 2:34 PM

Received (Left aligned):
┌───────────────────────────────┐
│ Sure! Library at 3pm works    │
│ for me 📚                     │
└───────────────────────────────┘
2:35 PM
```

### Screen Wireframes

#### Landing Page

```
┌──────────────────────────────────────────────────┐
│                                                  │
│              🎓 CAMPUS CONNECT                   │
│                                                  │
│         Beyond Dating. Built for Real           │
│            Student Connections.                  │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  📧 Enter your .edu email                  │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│         ┌────────────────────────┐              │
│         │    Get Started →       │              │
│         └────────────────────────┘              │
│                                                  │
│  ─────────────────────────────────────────────  │
│                                                  │
│       ✅ Verified Students Only                 │
│       🔒 Privacy-First Connections              │
│       🎯 Intent-Based Networking                │
│                                                  │
└──────────────────────────────────────────────────┘
```

#### Discovery Feed

```
┌──────────────────────────────────────────────────┐
│  ← Back       DISCOVER       ⚙️ Settings         │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  📖 Study  │  🤝 Social  │  🚀 Project     │ │
│  │    ────      ══════════      ────          │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  [Avatar]  Alex Chen                       │ │
│  │            Economics '24                    │ │
│  │            "Looking to meet new friends"    │ │
│  │                                ┌──────────┐│ │
│  │                                │ Connect  ││ │
│  │                                └──────────┘│ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  [Avatar]  Jordan Lee                      │ │
│  │            Psychology '25                   │ │
│  │            "Coffee & conversation ☕"       │ │
│  │                                ┌──────────┐│ │
│  │                                │ Connect  ││ │
│  │                                └──────────┘│ │
│  └────────────────────────────────────────────┘ │
│                                                  │
├──────────────────────────────────────────────────┤
│  🏠 Home    👥 Connections    💬 Chats    👤 Me │
└──────────────────────────────────────────────────┘
```

---

## 🔒 Security Measures

### Authentication Security

| Measure          | Implementation         |
| ---------------- | ---------------------- |
| Password Hashing | Supabase Auth (bcrypt) |
| OTP Expiry       | 10 minutes             |
| OTP Attempts     | 3 per session          |
| Session Duration | 7 days (refresh token) |
| Rate Limiting    | 5 login attempts/min   |

### Data Protection

| Data Type       | Protection Level                     |
| --------------- | ------------------------------------ |
| ID Card Images  | Private bucket, owner-only access    |
| Email Addresses | Not exposed to other users           |
| Passwords       | Never stored (Supabase Auth handles) |
| Chat Messages   | RLS - connection parties only        |
| Profile Data    | RLS - verified users only            |

### Input Validation

```typescript
// Example validation schemas
const emailSchema = z
  .string()
  .email()
  .regex(/\.edu$/);
const passwordSchema = z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/);
const bioSchema = z.string().max(300);
const nameSchema = z.string().min(2).max(50);
```

### Content Moderation (MVP)

- **Phase 1**: Manual review if reported
- **Future**: AI-based text moderation

---

## 🧪 Testing Strategy

### Test Categories

| Category          | Coverage Target | Tools                   |
| ----------------- | --------------- | ----------------------- |
| Unit Tests        | 60%             | Vitest                  |
| Integration Tests | 40%             | Vitest + Supabase Local |
| E2E Tests         | Critical paths  | Playwright              |
| Manual QA         | All features    | Checklist               |

### Critical Test Cases

#### Authentication Flow

- [ ] Valid .edu email accepted
- [ ] Invalid domain rejected
- [ ] OTP sent successfully
- [ ] OTP verification works
- [ ] Wrong OTP rejected
- [ ] OTP expires after 10 min
- [ ] Password requirements enforced

#### Connection Flow

- [ ] Connection request sent
- [ ] Notification received
- [ ] Accept unlocks chat
- [ ] Reject hides from feed
- [ ] Cannot message before accept

#### Chat Flow

- [ ] Messages delivered in real-time
- [ ] Message history persists
- [ ] Emoji picker works
- [ ] Timestamps display correctly

### Load Testing (Pre-Launch)

```bash
# Target: Handle 50 concurrent users
# Tool: k6 (Grafana)

k6 run --vus 50 --duration 30s load-test.js
```

---

## ✅ Launch Checklist

### Pre-Launch (T-7 Days)

- [ ] All P0 features complete
- [ ] Supabase production instance configured
- [ ] Brevo SMTP verified
- [ ] Domain verified (.edu whitelist)
- [ ] RLS policies tested
- [ ] Storage buckets configured
- [ ] Error monitoring (Sentry) setup
- [ ] Analytics (Mixpanel/Posthog) integrated

### Launch Day (T-0)

- [ ] Deploy to Vercel production
- [ ] DNS configured
- [ ] SSL certificate active
- [ ] Smoke test all flows
- [ ] Monitor error rates
- [ ] Support channel ready (Discord/Email)

### Post-Launch (T+1 Week)

- [ ] Daily active user tracking
- [ ] Gather user feedback
- [ ] Bug triage and fixes
- [ ] Performance monitoring
- [ ] Iterate on feedback

---

## 📈 Success Metrics

### Primary Metrics (Week 4)

| Metric             | Target | Measurement        |
| ------------------ | ------ | ------------------ |
| Verified Signups   | 50     | Database count     |
| Daily Active Users | 30     | Login events/day   |
| Connection Rate    | 60%    | Accepts / Requests |
| Avg. Messages/User | 10/day | Message count      |
| 7-Day Retention    | 40%    | Return visits      |

### Secondary Metrics

| Metric                   | Purpose             |
| ------------------------ | ------------------- |
| Time to First Connection | Onboarding friction |
| Mode Distribution        | Feature preference  |
| Peak Usage Hours         | Server planning     |
| Drop-off Points          | UX improvement      |

### Feedback Collection

- In-app feedback button
- Weekly email survey (Typeform)
- Discord community channel
- 1-on-1 user interviews (10 users)

---

## ⚠️ Known Limitations

### Phase 1 Constraints

| Limitation            | Workaround             | Phase 2 Fix        |
| --------------------- | ---------------------- | ------------------ |
| Single campus only    | Curated launch         | Multi-campus       |
| No push notifications | Email for new messages | FCM integration    |
| No file sharing       | Share links externally | In-chat uploads    |
| Basic matching        | Browse all users       | AI recommendations |
| No moderation tools   | Manual via database    | Admin dashboard    |
| No profile analytics  | None                   | "Who viewed you"   |

### Technical Debt Accepted

1. **Hardcoded college list** - Will need dynamic college database
2. **No pagination** - Okay for 50 users, needs fixing for scale
3. **Basic error handling** - Improve UX for edge cases
4. **No offline support** - Requires PWA implementation

---

## 📞 Support & Feedback

### For Pilot Users

- **Email**: support@campusconnect.dev
- **Discord**: [Campus Connect Pilot](https://discord.gg/campusconnect)
- **Response Time**: <24 hours

### Bug Reporting

Please include:

1. Device/Browser
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Screenshots (if applicable)

---

<p align="center">
  <strong>Let's build meaningful campus connections! 🎓</strong>
</p>

<p align="center">
  <sub>Phase 1 MVP Document v1.0 • Last Updated: January 2025</sub>
</p>
