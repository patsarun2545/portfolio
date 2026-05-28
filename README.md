# 🚀 Portfolio Next

A modern, bilingual portfolio website built with Next.js 16, featuring an admin panel for content management. Supports English and Thai languages with real-time content updates and secure authentication.

## 🛠️ Tech Stack

| Layer      | Technology                                                            |
| ---------- | --------------------------------------------------------------------- |
| Framework  | Next.js 16.2.6                                                        |
| Frontend   | React 19.2.4, TypeScript                                              |
| Backend    | Next.js API Routes                                                    |
| Runtime    | Node.js                                                               |
| Database   | PostgreSQL (Neon)                                                     |
| Auth       | NextAuth v5 (beta) with JWT                                           |
| Storage    | ImageKit                                                              |
| Validation | Zod                                                                   |
| Caching    | Next.js revalidatePath                                                |
| UI Extras  | TailwindCSS, shadcn/ui, Radix UI, Lucide React, next-themes, @dnd-kit |
| Tools      | Prisma, ESLint, Prettier                                              |

## ✨ Features Overview

- **Bilingual Support**: English and Thai language switching with locale-aware content
- **Role-Based Access Control**: Admin panel with JWT-based authentication
- **Admin Dashboard**: Centralized content management interface
- **Content Management**: Full CRUD operations for About, Skills, Projects, Experience, Education, and Blog Posts
- **Image Management**: Upload and manage multiple images per project/blog post via ImageKit
- **Drag-and-Drop Reordering**: Sort skills, projects, experience, and education items
- **Featured Projects**: Flag projects as featured for homepage highlighting
- **Blog Publishing**: Draft/publish workflow with publication date tracking
- **Contact Form**: Public contact form with EmailJS email notifications
- **Account Lockout**: Automatic account lockout after 5 failed login attempts (15 minutes)
- **CSRF Protection**: Token-based CSRF validation for admin and public endpoints
- **Rate Limiting**: Upstash Redis-based rate limiting for API endpoints
- **XSS Prevention**: Input sanitization using sanitize-html
- **Responsive Design**: Mobile-first responsive UI

## � Project Structure

```
src/
├── app/
│   ├── (public)/              # Public-facing pages
│   │   ├── blog/[slug]/       # Individual blog post pages
│   │   ├── layout.tsx         # Public layout with Navbar
│   │   └── page.tsx           # Homepage with all sections
│   ├── admin/                 # Admin panel pages
│   │   ├── about/             # About section management
│   │   ├── blog/              # Blog post management
│   │   ├── dashboard/        # Admin dashboard
│   │   ├── education/         # Education management
│   │   ├── experience/       # Experience management
│   │   ├── login/            # Admin login page
│   │   ├── messages/          # Contact messages inbox
│   │   ├── projects/          # Projects management
│   │   ├── skills/            # Skills management
│   │   └── layout.tsx         # Admin layout with sidebar
│   ├── api/
│   │   ├── admin/            # Admin API endpoints
│   │   │   ├── about/         # About CRUD + avatar upload
│   │   │   ├── blog/          # Blog CRUD + image management
│   │   │   ├── csrf/          # CSRF token generation
│   │   │   ├── education/     # Education CRUD + reordering
│   │   │   ├── experience/    # Experience CRUD + reordering
│   │   │   ├── messages/      # Contact messages management
│   │   │   ├── projects/      # Projects CRUD + images + toggles (featured/visibility)
│   │   │   ├── skills/        # Skills CRUD + reordering + visibility + categories + toggle
│   │   │   └── upload/        # Image upload to ImageKit
│   │   ├── auth/[...nextauth]/ # NextAuth authentication
│   │   ├── contact/           # Public contact form
│   │   └── health/            # Health check endpoint
│   ├── globals.css           # Global styles
│   └── layout.tsx            # Root layout with providers
├── components/
│   ├── admin/                # Admin-specific components
│   │   ├── AdminLayoutWrapper.tsx
│   │   ├── AdminMobileHeader.tsx
│   │   ├── AdminSidebar.tsx
│   │   └── index.ts
│   ├── public/               # Public-facing components
│   │   ├── AboutSection.tsx
│   │   ├── BackToTopButton.tsx
│   │   ├── BlogSection.tsx
│   │   ├── ContactSection.tsx
│   │   ├── EducationSection.tsx
│   │   ├── ExperienceSection.tsx
│   │   ├── HeroSection.tsx
│   │   ├── ImageCarousel.tsx
│   │   ├── LanguageToggle.tsx
│   │   ├── Navbar.tsx
│   │   ├── ProjectsSection.tsx
│   │   ├── ScrollProgressBar.tsx
│   │   ├── ScrollToContactButton.tsx
│   │   ├── SkillsSection.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── index.ts
│   ├── ui/                   # shadcn/ui components
│   ├── LocaleProvider.tsx    # i18n locale provider
│   └── theme-provider.tsx    # Theme provider
├── hooks/
│   └── useLocale.ts          # Locale hook for i18n
├── lib/
│   ├── actions/              # Server actions
│   │   └── index.ts          # Login/logout actions
│   ├── auth.ts               # NextAuth configuration
│   ├── csrf-client.ts        # Client-side CSRF utilities
│   ├── csrf.ts               # CSRF token generation/validation
│   ├── db.ts                 # Prisma client
│   ├── edge-auth.ts          # Edge-compatible auth
│   ├── env.ts                # Environment variable validation
│   ├── i18n/                 # Internationalization
│   │   ├── admin/            # Admin translations (en.json, th.json)
│   │   ├── common/           # Common translations (en.json, th.json)
│   │   ├── index.ts          # i18n client
│   │   └── server.ts         # i18n server
│   ├── rate-limit.ts         # Upstash Redis rate limiting
│   ├── sanitize.ts           # HTML/text sanitization
│   ├── utils.ts              # Utility functions
│   └── validations/          # Zod schemas
│       └── index.ts          # All validation schemas
├── proxy.ts                  # Next.js proxy configuration
└── types/                    # TypeScript type definitions
    ├── index.ts
    └── next-auth.d.ts
```

## 🗃️ Database Schema

| Model          | Description                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| About          | Personal information (name, title, bio, avatar, resume, social links, location) with Thai translations        |
| Skill          | Skills with categories, proficiency levels, sort order, and visibility flags                                  |
| Project        | Portfolio projects with descriptions, tech stack, GitHub/live URLs, featured/visibility flags, and sort order |
| ProjectImage   | Multiple images per project with sort order                                                                   |
| Experience     | Work experience with company, position, dates, and descriptions with Thai translations                        |
| Education      | Education history with degree, institution, field of study, GPA, and descriptions with Thai translations      |
| BlogPost       | Blog posts with title, slug, content, tags, publishing status, and publication date                           |
| BlogImage      | Multiple images per blog post with sort order                                                                 |
| ContactMessage | Contact form submissions with read status tracking                                                            |
| AdminUser      | Admin users with password hash, failed attempts tracking, and lockout mechanism                               |

## 🔄 System Flow

## 01 · Authentication

```
User → Login Page → POST /api/auth/[...nextauth] → Validate Credentials
                                      ↓
                              Check Account Lockout
                                      ↓
                              bcrypt.compare() Password
                                      ↓
                              Update Failed Attempts
                                      ↓
                              JWT Session (24h max)
                                      ↓
                              Redirect to /admin/dashboard
```

- **Admin Login**: Username/password authentication via NextAuth Credentials provider
- **Account Lockout**: After 5 failed attempts, account locked for 15 minutes
- **Session Strategy**: JWT with 24-hour max age
- **Failed Attempts Tracking**: Resets on successful login

| Status | Description                                    |
| ------ | ---------------------------------------------- |
| Active | User can login normally                        |
| Locked | Account locked due to too many failed attempts |

## 02 · Customer Flow

```
Visitor → Homepage → View Sections (Hero, About, Skills, Projects, Experience, Education, Blog)
         ↓
    Read Blog Post → /blog/[slug]
         ↓
    Contact Form → POST /api/contact → Rate Limit → Save to DB → EmailJS Notification
```

- **View Portfolio**: Public access to all portfolio sections
- **Read Blog**: View published blog posts with images
- **Contact Form**: Submit messages with rate limiting (IP-based and email-based)
- **Bilingual Switching**: Toggle between English and Thai

## 03 · Admin Flow

```
Admin → Login → Dashboard
         ↓
    Manage Content:
         ├── About → Update personal info, upload avatar
         ├── Skills → CRUD, reorder, toggle visibility
         ├── Projects → CRUD, upload images, toggle featured/visibility, reorder
         ├── Experience → CRUD, reorder
         ├── Education → CRUD, reorder
         ├── Blog → CRUD, publish/unpublish, manage images
         └── Messages → View, mark as read
         ↓
    All Changes → revalidatePath("/") → Cache Invalidation
```

- **Dashboard**: Overview of all content sections
- **CRUD Operations**: Create, read, update, delete for all content types
- **Image Upload**: Upload to ImageKit with drag-and-drop
- **Reordering**: Drag-and-drop sort for skills, projects, experience, education
- **Toggles**: Featured projects, skill visibility, blog publishing
- **Messages**: View contact submissions, mark as read

| Content Type | Actions                                                  |
| ------------ | -------------------------------------------------------- |
| About        | Update info, upload avatar                               |
| Skills       | CRUD, reorder, toggle visibility                         |
| Projects     | CRUD, upload images, toggle featured/visibility, reorder |
| Experience   | CRUD, reorder                                            |
| Education    | CRUD, reorder                                            |
| Blog         | CRUD, publish/unpublish, manage images                   |
| Messages     | View, mark as read                                       |

## Caching Strategy

| Tag pattern | Scope    | Revalidated on                                                             |
| ----------- | -------- | -------------------------------------------------------------------------- |
| `/`         | Homepage | All content updates (about, skills, projects, experience, education, blog) |
| `3600s`     | Homepage | Time-based revalidation (1 hour)                                           |

## 🔐 Security

- **Authentication**: NextAuth v5 with JWT session strategy
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Zod schemas for all API endpoints
- **CSRF Protection**: Token-based CSRF validation for admin (httpOnly) and public forms
- **Rate Limiting**: Upstash Redis with sliding window (60 req/min for API, 30 req/min for uploads)
- **Account Lockout**: Automatic lockout after 5 failed login attempts (15 minutes)
- **XSS Prevention**: sanitize-html for text and HTML content sanitization
- **Environment Validation**: Zod-based env variable validation at runtime
- **Secure Cookies**: httpOnly, secure, sameSite=strict for CSRF tokens
- **Fail-Closed**: Rate limiter blocks requests on failure in production

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- ImageKit account
- Upstash Redis account (optional, for production rate limiting)
- EmailJS account (optional, for contact form notifications)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Run database migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed admin user (optional)
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portfolio.

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/portfolio?sslmode=require

# NextAuth
NEXTAUTH_SECRET=your-generated-secret-here-run-openssl-rand-base64-32
NEXTAUTH_URL=https://your-domain.vercel.app

# CORS
ALLOWED_ORIGINS=https://your-domain.vercel.app

# ImageKit
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# Prisma
PRISMA_LOG_LEVEL=error

# Environment Validation
STRICT_ENV_VALIDATION=false

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxx
UPSTASH_RATELIMIT_LIMIT=10
UPSTASH_RATELIMIT_WINDOW=60

# Admin Seed Password
SEED_ADMIN_PASSWORD=your_secure_password_here

# EmailJS (Contact Form Notifications)
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:migrate   # Run database migrations
npm run db:generate  # Generate Prisma client
npm run db:seed      # Seed database with initial data
```

## 👤 Author

**Patsarun Rungruangtanakul**

- Full Stack Developer
- Next.js, TypeScript, PostgreSQL, Prisma
- Email: patsarun2545@gmail.com
- GitHub: [@patsarun2545](https://github.com/patsarun2545)
