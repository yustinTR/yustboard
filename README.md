# YustBoard Documentation

Welcome to YustBoard - A modern Next.js dashboard application with Google integrations, built with TypeScript and Tailwind CSS.

## 📚 Documentation Structure

### [Development Guidelines](documentation/DEVELOPMENT_GUIDELINES.md)
Complete development standards including:
- Pre-commit requirements and build verification
- Storybook component story requirements
- Glass morphism design system
- Next.js standards and best practices
- Code quality and TypeScript standards
- Development workflow

### [Deployment Guide](documentation/DEPLOYMENT.md)
Comprehensive deployment documentation:
- **Vercel + Supabase**: Free tier deployment with Supabase database
- **Plesk VPS**: Self-hosted deployment on VPS with Plesk control panel
- Environment configuration
- Post-deployment checklists
- Troubleshooting guides

### [Google APIs Setup](documentation/GOOGLE_APIS_SETUP.md)
Complete guide for API integrations:
- Google Cloud project setup
- OAuth 2.0 configuration
- Gmail, Calendar, Drive API setup
- Free API tier information (News, Weather)
- Supabase Storage configuration
- Quota limits and billing

### [Storybook Documentation](documentation/STORYBOOK.md)
Component development and testing:
- Storybook setup and configuration
- Chromatic visual regression testing
- GitHub Actions workflows
- Writing component stories
- Available component stories

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- PostgreSQL database (local or Supabase)
- Google Cloud account for API access
- Git for version control

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yustinTR/yustboard.git
cd yustboard
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env.local` file:
```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# APIs
NEWS_API_KEY=your_news_api_key
OPENWEATHER_API_KEY=your_weather_api_key
```

4. **Run database migrations**
```bash
npx prisma migrate dev
npx prisma generate
```

5. **Start development server**
```bash
npm run dev
```

Visit http://localhost:3000

---

## 🏗️ Project Structure

```
yustboard/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── (auth)/           # Authentication pages
├── components/            # React components
│   ├── ui/               # Base UI components
│   └── dashboard/        # Dashboard-specific components
├── documentation/         # All documentation files
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

---

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript compiler
npm run storybook    # Start Storybook
npm run chromatic    # Run Chromatic tests
```

---

## 🎨 Features

### Dashboard Widgets
- **Timeline**: Social media-style posts and updates
- **Gmail**: Email inbox integration
- **Calendar**: Google Calendar events and tasks
- **Weather**: Current weather and forecasts
- **News**: Latest news articles
- **Banking**: Transaction tracking
- **Files**: Google Drive recent files
- **Fitness**: Google Fit integration

### Design System
- Glass morphism UI design
- Dark/Light mode support
- Responsive layout
- Tailwind CSS styling
- Component-based architecture

### Technical Stack
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **Component Development**: Storybook
- **Visual Testing**: Chromatic

---

## 📝 Development Guidelines

Before contributing, please review:

1. **[Development Guidelines](documentation/DEVELOPMENT_GUIDELINES.md)** - Code standards and practices
2. **Build Verification** - Always run `npm run build` before committing
3. **Component Stories** - Create Storybook stories for new components
4. **Glass Morphism Design** - Follow the established design system
5. **TypeScript Standards** - Use proper types, avoid `any`

---

## 🚢 Deployment Options

### Free Tier (Recommended for Personal Use)
- **Hosting**: Vercel (100GB bandwidth/month)
- **Database**: Supabase (500MB storage)
- **Details**: See [Deployment Guide](documentation/DEPLOYMENT.md#vercel--supabase-deployment)

### Self-Hosted
- **Platform**: Plesk VPS
- **Database**: PostgreSQL
- **Details**: See [Deployment Guide](documentation/DEPLOYMENT.md#plesk-vps-deployment)

---

## 🔧 Troubleshooting

### Common Issues

**Build Failures**
- Run `npm run build` to identify errors
- Check for TypeScript errors with `npm run typecheck`
- Verify all imports are correct

**API Integration Issues**
- Verify Google Cloud APIs are enabled
- Check OAuth redirect URLs match your domain
- Ensure environment variables are set correctly

**Database Connection**
- Verify DATABASE_URL is correct
- Run `npx prisma migrate dev` for migrations
- Check PostgreSQL service is running

For more detailed troubleshooting, see the specific guides in the documentation folder.

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Google APIs Documentation](https://developers.google.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Storybook Documentation](https://storybook.js.org/docs)

---

## 📄 License

This project is private and proprietary.

---

## 👥 Contributors

- Yustin Troost - Lead Developer

---

For detailed information on any topic, please refer to the specific documentation files in the `documentation/` folder.