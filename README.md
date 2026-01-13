<p align="center">
  <img src="https://img.shields.io/badge/Campus%20Connect-Student%20Networking-7C3AED?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTE3IDIxdi0yYTQgNCAwIDAgMC00LTRIOWE0IDQgMCAwIDAtNCA0djIiPjwvcGF0aD48Y2lyY2xlIGN4PSI5IiBjeT0iNyIgcj0iNCI+PC9jaXJjbGU+PHBhdGggZD0iTTIzIDIxdi0yYTQgNCAwIDAgMC0zLTMuODciPjwvcGF0aD48cGF0aCBkPSJNMTYgMy4xM2E0IDQgMCAwIDEgMCA3Ljc1Ij48L3BhdGg+PC9zdmc+" alt="Campus Connect"/>
</p>

<h1 align="center">🎓 Campus Connect</h1>

<p align="center">
  <strong>Beyond Dating. Built for Real Student Connections.</strong>
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-philosophy">Philosophy</a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite" alt="Vite"/>
  <img src="https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=flat-square&logo=tailwindcss" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/Supabase-Latest-3ECF8E?style=flat-square&logo=supabase" alt="Supabase"/>
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript" alt="TypeScript"/>
</p>

---

## 📖 Overview

**Campus Connect** is a niche networking platform designed **exclusively for verified college students**. Unlike traditional social or dating apps, Campus Connect focuses on **intent-based networking**—whether you need a study buddy, a co-founder for a hackathon, or just someone to grab a coffee with.

### 🎯 The Problem We Solve

| Traditional Apps          | Campus Connect                             |
| ------------------------- | ------------------------------------------ |
| Open to anyone, anonymous | Verified students only (.edu email)        |
| Generic "swipe" mechanics | Intent-driven modes (Study/Social/Project) |
| Privacy concerns          | Double opt-in connection system            |
| Overwhelming global reach | Campus-focused proximity                   |
| One-size-fits-all         | Purpose-specific matching                  |

---

## 💡 Philosophy

### The "Walled Garden" Approach

Campus Connect creates a **trusted, closed ecosystem** through three core principles:

#### 1. 🔐 Mandatory Verification

- **No .edu email = No entry**
- College ID card upload for accountability
- OTP verification via institutional email
- "Identity Verified" badge for completed verification

#### 2. 🎯 Intent-Driven Connections

- Users must select a **"Mode"** before browsing
- Clear expectations from the start
- Reduces mismatched connections
- Respects everyone's time and purpose

#### 3. 🤝 Mutual Privacy

- **Double opt-in** required for chat
- No unsolicited messages
- Both parties must accept connection
- Safe, consent-based interaction

---

## ✨ Features

### 🆔 Identity & Verification System

```
┌─────────────────────────────────────────────────────────────┐
│                    VERIFICATION FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   📧 .edu Email    →    📱 OTP Code    →    🪪 ID Upload    │
│      Entry              Verification        Accountability  │
│                                                             │
│                    ↓                                        │
│                                                             │
│              ✅ "Identity Verified" Badge                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- **OTP Verification**: Integration with Brevo SMTP for secure 6-digit codes
- **ID Transparency**: College ID upload for community accountability
- **Automated Process**: No manual admin approval required
- **Visual Badge**: Verified users display a trust indicator

### 🎛️ Triple Mode System

Users can toggle their current status at any time:

| Mode        | Icon | Purpose                     | Filter Focus                 |
| ----------- | ---- | --------------------------- | ---------------------------- |
| **Study**   | 📖   | Academic collaboration      | Same major, specific classes |
| **Social**  | 🤝   | Campus life & friendships   | Hobbies, sports, interests   |
| **Project** | 🚀   | Startup & competition teams | Skills, roles, experience    |

### 📱 Social Feed & Posts

Campus Connect includes a rich social feed where verified students can share content with the campus community:

```
┌─────────────────────────────────────────────────────────────┐
│                      SOCIAL FEED                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 💭 Thoughts    │ 📸 Photos    │ 🚀 Projects         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📅 Events      │ 📚 Resources  │ ❓ Questions        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│           ↓ AI Content Moderation ↓                        │
│                                                             │
│              ✅ Safe Content Published                     │
│              ❌ Inappropriate Content Blocked              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Post Types

| Type          | Icon | Description                               | Features                              |
| ------------- | ---- | ----------------------------------------- | ------------------------------------- |
| **Thoughts**  | 💭   | Share ideas, opinions, campus experiences | Text (up to 500 chars), emojis        |
| **Photos**    | 📸   | Share campus life, events, memories       | Image upload (moderated), captions    |
| **Projects**  | 🚀   | Showcase work, find collaborators         | Title, description, links, team roles |
| **Events**    | 📅   | Promote campus events, meetups            | Date, time, location, RSVP            |
| **Resources** | 📚   | Share study materials, notes              | File links, subject tags              |
| **Questions** | ❓   | Ask campus community for help             | Q&A format, best answer selection     |

#### Content Moderation

- 🛡️ **AI-Powered Image Scanning**: Automatic detection of inappropriate/vulgar content
- ✅ **Pre-publish Review**: Images are scanned before being posted
- 🚫 **Zero Tolerance**: Vulgar, explicit, or harmful content is automatically blocked
- 📢 **Community Reporting**: Users can flag inappropriate posts
- ⚠️ **Violation Consequences**: Account warnings → Temporary suspension → Permanent ban

#### Feed Features

- ❤️ **Likes**: Show appreciation for posts
- 💬 **Comments**: Engage in discussions
- 🔖 **Save**: Bookmark posts for later
- 🔗 **Share**: Share posts with connections
- 🏷️ **Tags**: Categorize posts by topic/mode

### 💬 Connection & Real-time Chat

```
┌─────────────────────────────────────────────────────────┐
│                CONNECTION FLOW                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   User A                              User B            │
│      │                                   │              │
│      │─────── Sends Connect ──────────→ │              │
│      │                                   │              │
│      │                              Receives            │
│      │                              Request             │
│      │                                   │              │
│      │ ←────── Accepts Request ─────────│              │
│      │                                   │              │
│      ▼                                   ▼              │
│   ╔══════════════════════════════════════════╗         │
│   ║        💬 CHAT UNLOCKED 🔓               ║         │
│   ╚══════════════════════════════════════════╝         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Chat Features (Powered by Supabase Realtime)

- ✉️ **Text & Emojis**: Full Unicode emoji support
- 🎭 **Campus Stickers**: Custom sticker packs for campus humor
- 📎 **File Upload**: Share lecture notes, PDFs, project briefs, photos, videos
- ⚡ **Real-time**: Instant message delivery
- 💬 **Read Receipts**: Know when messages are seen

### 🌐 Discovery Control

| Range              | Description      | Use Case                |
| ------------------ | ---------------- | ----------------------- |
| **My Campus Only** | High intimacy    | Local connections       |
| **Cross-Campus**   | Wider networking | Regional/national reach |

---

## 🛠️ Tech Stack

### Frontend

| Technology       | Purpose                 |
| ---------------- | ----------------------- |
| **React.js 18**  | UI Library              |
| **Vite**         | Build Tool & Dev Server |
| **Tailwind CSS** | Utility-first CSS       |
| **TypeScript**   | Type Safety             |
| **React Router** | Client-side Routing     |

### Backend & Database

| Technology             | Purpose               |
| ---------------------- | --------------------- | --- |
| **Supabase**           | Backend-as-a-Service  |     |
| **Supabase Realtime**  | WebSocket Connections |
| **Row Level Security** | Data Protection       |

### Authentication & Email

| Technology        | Purpose                 |
| ----------------- | ----------------------- |
| **Supabase Auth** | Authentication Provider |
| **Brevo SMTP**    | OTP Email Delivery      |

### Storage & Hosting

| Technology           | Purpose          |
| -------------------- | ---------------- |
| **Supabase Buckets** | File Storage     |
| **Vercel**           | Frontend Hosting |
| **CDN**              | Asset Delivery   |

### Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        CAMPUS CONNECT                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐        ┌────────────────────────────────┐   │
│  │                │        │           SUPABASE             │   │
│  │    FRONTEND    │        │                                │   │
│  │  ┌──────────┐  │        │  ┌────────┐  ┌─────────────┐  │   │
│  │  │  React   │  │◄──────►│  │  Auth  │  │  PostgreSQL │  │   │
│  │  │  + Vite  │  │  REST  │  └────────┘  └─────────────┘  │   │
│  │  └──────────┘  │  API   │                                │   │
│  │                │        │  ┌────────┐  ┌─────────────┐  │   │
│  │  ┌──────────┐  │◄──────►│  │Realtime│  │   Buckets   │  │   │
│  │  │ Tailwind │  │  WS    │  └────────┘  └─────────────┘  │   │
│  │  └──────────┘  │        │                                │   │
│  │                │        │        ┌───────────┐          │   │
│  └────────────────┘        │        │    RLS    │          │   │
│         │                  │        └───────────┘          │   │
│         │                  └────────────────────────────────┘   │
│         ▼                                                       │
│  ┌────────────────┐        ┌────────────────────────────────┐   │
│  │    VERCEL      │        │           BREVO                │   │
│  │   (Hosting)    │        │         (SMTP/OTP)             │   │
│  └────────────────┘        └────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** or **pnpm**
- **Supabase Account** (free tier available)
- **Brevo Account** (for SMTP)

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Brevo SMTP (configured in Supabase Dashboard)
# No frontend env needed - configured server-side
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/campus-connect.git

# Navigate to project directory
cd campus-connect

# Install dependencies
npm install

# Start development server
npm run dev
```

### Supabase Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Configure Authentication**:

   - Enable Email provider
   - Set up SMTP with Brevo credentials

3. **Run Database Migrations** (SQL provided in `/supabase/migrations`)

4. **Set up Storage Buckets**:

   - `id-cards` (private)
   - `chat-attachments` (authenticated)
   - `profile-avatars` (public)

5. **Configure Row Level Security** (RLS policies in `/supabase/policies`)

---

## 📁 Project Structure

```
campus-connect/
├── public/                     # Static assets
│   ├── favicon.ico
│   └── assets/
│       ├── images/
│       └── stickers/
│
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── auth/               # Authentication components
│   │   ├── chat/               # Chat interface components
│   │   ├── common/             # Shared components (Button, Input, etc.)
│   │   ├── discovery/          # User discovery & browse
│   │   ├── layout/             # Layout components (Header, Footer, etc.)
│   │   └── profile/            # Profile related components
│   │
│   ├── contexts/               # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── ChatContext.tsx
│   │   └── ModeContext.tsx
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useChat.ts
│   │   ├── useConnections.ts
│   │   └── useDiscovery.ts
│   │
│   ├── lib/                    # Third-party configurations
│   │   ├── supabase.ts         # Supabase client
│   │   └── utils.ts            # Utility functions
│   │
│   ├── pages/                  # Page components
│   │   ├── Auth/
│   │   ├── Chat/
│   │   ├── Discovery/
│   │   ├── Home/
│   │   ├── Onboarding/
│   │   └── Profile/
│   │
│   ├── services/               # API service functions
│   │   ├── authService.ts
│   │   ├── chatService.ts
│   │   ├── connectionService.ts
│   │   └── userService.ts
│   │
│   ├── types/                  # TypeScript type definitions
│   │   ├── auth.types.ts
│   │   ├── chat.types.ts
│   │   └── user.types.ts
│   │
│   ├── App.tsx                 # Main App component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
│
├── supabase/
│   ├── migrations/             # Database migrations
│   ├── policies/               # RLS policies
│   └── functions/              # Edge functions (if any)
│
├── .env.local                  # Environment variables
├── .env.example                # Example env file
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🗄️ Database Schema

### Core Tables

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  college_name TEXT,
  major TEXT,
  graduation_year INTEGER,
  bio TEXT,
  id_card_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  current_mode TEXT DEFAULT 'social', -- 'study' | 'social' | 'project'
  discovery_range TEXT DEFAULT 'campus', -- 'campus' | 'cross-campus'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User interests/skills for matching
CREATE TABLE public.user_interests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  interest TEXT NOT NULL,
  category TEXT NOT NULL, -- 'hobby' | 'skill' | 'academic'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Connections (double opt-in system)
CREATE TABLE public.connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- 'pending' | 'accepted' | 'rejected'
  mode_context TEXT, -- The mode when connection was made
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, receiver_id)
);

-- Chat messages
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID REFERENCES public.connections(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT,
  message_type TEXT DEFAULT 'text', -- 'text' | 'sticker' | 'file'
  file_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies

```sql
-- Users can only view their own profile fully, others see limited data
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Connections require both parties involvement
CREATE POLICY "Users involved in connection can view"
  ON public.connections FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Messages only visible to connected users
CREATE POLICY "Connected users can view messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.connections
      WHERE id = messages.connection_id
      AND status = 'accepted'
      AND (requester_id = auth.uid() OR receiver_id = auth.uid())
    )
  );
```

---

## 🛣️ Roadmap

### Phase 1: The "Genesis 50" 🎯 (Current)

> MVP launch to validate core concept

- [x] Project setup & architecture
- [ ] User authentication with .edu email
- [ ] OTP verification via Brevo
- [ ] Basic profile creation with ID upload
- [ ] Triple Mode system implementation
- [ ] Connection request system (double opt-in)
- [ ] Real-time chat (text + emojis)
- [ ] Campus-only discovery
- **Goal**: 50 active, verified users

### Phase 2: Engagement Scaling 📈

> Increase stickiness and value

- [ ] "Campus Events" feed
- [ ] AI-based "Smart Matches" for Project Mode
- [ ] Enhanced sticker packs
- [ ] Push notifications
- [ ] User analytics dashboard
- [ ] Profile insights ("Who viewed you")

### Phase 3: SaaS Transition 💼

> Monetization and institutional sales

- [ ] **University Tier**: Sell to Student Unions as private social layer
- [ ] **Premium Student Tier**:
  - Boosted Discovery
  - Unlimited Multi-Campus Access
  - Advanced filters
- [ ] **B2B Partnerships**:
  - Local business integrations
  - Meet-up Coupons for connected pairs
- [ ] White-label solutions

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a pull request.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

- **Project Lead**: [Your Name]
- **Email**: contact@campusconnect.dev
- **Twitter**: [@CampusConnectHQ](https://twitter.com/CampusConnectHQ)

---

<p align="center">
  Made with 💜 for students, by students
</p>

<p align="center">
  <sub>© 2025 Campus Connect. All rights reserved.</sub>
</p>
