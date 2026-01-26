# Campus Connect

A modern social networking platform for college students to connect, collaborate, and build communities.

## 🚀 Features

- **Multi-Mode Experience**: Switch between Study, Social, and Project modes
- **Real-time Feed**: Share posts, images, and updates with your campus community
- **Direct Messaging**: Chat with other students in real-time
- **Discovery**: Find and connect with students based on interests and majors
- **Profile Management**: Customize your profile with bio, avatar, and academic info
- **Secure Authentication**: Email-based OTP verification
- **Responsive Design**: Optimized for mobile and desktop

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Routing**: React Router v7
- **State Management**: Zustand
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Deployment**: Cloudflare Pages

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Cloudflare account (for deployment)

## 🏃‍♂️ Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd campus-connect
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
BREVO_API_KEY=your_brevo_api_key
```

### 4. Run the development server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app.

### 5. Build for production

```bash
npm run build
```

## 🌐 Deployment

### Deploy to Cloudflare Pages

See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for a quick start guide or [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick steps:**

1. Push code to GitHub
2. Connect repository to Cloudflare Pages
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables
6. Deploy!

Your site will be live at: `https://your-project.pages.dev`

## 📁 Project Structure

```
campus-connect/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── discovery/   # Discovery page components
│   │   ├── feed/        # Feed and post components
│   │   ├── layout/      # Layout components
│   │   └── ui/          # Base UI components
│   ├── data/            # Static data (colleges list)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and configurations
│   ├── pages/           # Page components
│   │   ├── app/         # Main app pages
│   │   ├── auth/        # Authentication pages
│   │   └── onboarding/  # Onboarding flow
│   ├── stores/          # Zustand state stores
│   ├── types/           # TypeScript type definitions
│   └── main.tsx         # App entry point
├── supabase/
│   ├── functions/       # Edge functions
│   └── migrations/      # Database migrations
├── public/              # Static assets
└── ...config files
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## 🗄️ Database Setup

The project uses Supabase for the backend. Database migrations are in `supabase/migrations/`:

1. `001_initial_schema.sql` - Core tables (profiles, posts, comments, etc.)
2. `002_storage_buckets.sql` - Storage buckets for avatars and images
3. `003_add_campus_filter.sql` - Campus filtering functionality

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `BREVO_API_KEY` | Brevo API key for emails | Yes |

## 🎨 Customization

### Adding Colleges

Edit `src/data/colleges.ts` to add more colleges to the list.

### Styling

The app uses Tailwind CSS. Customize colors and themes in:

- `tailwind.config.js` - Theme configuration
- `src/index.css` - Global styles and custom utilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:

- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- Open an issue on GitHub
- Contact the development team

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Powered by [Supabase](https://supabase.com/)
- Deployed on [Cloudflare Pages](https://pages.cloudflare.com/)
- Icons by [Lucide](https://lucide.dev/)

---

Made with ❤️ for college students
