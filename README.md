# 🚀 Portfolio Next

[![Live Demo](https://img.shields.io/badge/Live-Demo-000?style=flat-square&logo=vercel&logoColor=white)](https://portfolio-patsarun.vercel.app/)

A modern, bilingual portfolio website built with Next.js 16 (App Router) and PostgreSQL, featuring an admin panel for content management, case studies, blog publishing, and GitHub stats integration.

---

## 🛠️ Tech Stack

| Layer      | Technology                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------ |
| Framework  | Next.js 16.2.6 (App Router)                                                                                       |
| Frontend   | React 19.2.4, TypeScript, Tailwind CSS 4                                                                           |
| Backend    | Next.js API Routes (serverless)                                                                                    |
| Runtime    | Node.js 18+                                                                                                        |
| Database   | PostgreSQL via Prisma ORM 7.8.0 with Neon serverless adapter (@prisma/adapter-neon)                               |
| Auth       | NextAuth v5 (beta.31) with JWT, bcryptjs 3.0.3                                                                    |
| Storage    | ImageKit 6.0.0 (cloud image storage)                                                                               |
| Validation | Zod 4.4.3                                                                                                         |
| Caching    | Next.js ISR (revalidate), Upstash Redis for rate limiting                                                           |
| UI Extras  | shadcn/ui, Radix UI, Lucide React, next-themes, @dnd-kit, react-markdown, rehype-highlight, Mermaid diagrams, Sonner |
| Tools      | Prisma, ESLint, Prettier, tsx, EmailJS, DOMPurify, sanitize-html                                                  |

---

## ✨ Features Overview

- **Bilingual Portfolio**: English and Thai language switching with locale-aware content for all sections
- **Admin Panel**: Protected dashboard with JWT authentication for content management
- **Content Management**: Full CRUD operations for About, Skills, Projects, Experience, Education, Engineering Highlights, and Blog Posts
- **Case Studies**: Detailed project case studies with problem/solution/challenges/results, architecture diagrams (Mermaid), tech stack used, timeline, team size, and key learnings
- **Image Management**: Upload and manage multiple images per project/blog post via ImageKit with drag-and-drop reordering
- **Drag-and-Drop Reordering**: Sort skills, projects, experience, education, and engineering highlights using @dnd-kit
- **Featured Projects**: Flag projects as featured for homepage highlighting with toggle endpoint
- **Blog Publishing**: Draft/publish workflow with publication date tracking, reading time, tags, and featured flag
- **GitHub Stats**: Display total commits, contributions last year, public repositories, and top languages via GitHub API
- **Contact Form**: Public contact form with CSRF protection, rate limiting (IP and email-based), and EmailJS notifications
- **Account Lockout**: Automatic account lockout after 5 failed login attempts (15 minutes)
- **CSRF Protection**: Token-based CSRF validation for admin (httpOnly with rotation) and public forms (non-httpOnly)
- **Rate Limiting**: Upstash Redis with sliding window (60 req/min for API, 30 req/min for uploads) with in-memory fallback for development
- **XSS Prevention**: Input sanitization using sanitize-html and DOMPurify for rich text content
- **SEO Optimization**: Auto-generated sitemap.xml and robots.txt with blog post URLs
- **Dark Mode**: Theme toggle with localStorage persistence via next-themes
- **Responsive Design**: Mobile-first responsive UI with collapsible admin sidebar

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (public)/                          # Public-facing pages route group
│   │   ├── blog/[slug]/                   # Individual blog post pages with markdown rendering
│   │   ├── layout.tsx                     # Public layout wrapper
│   │   └── page.tsx                       # Homepage with all sections (ISR: 3600s)
│   ├── admin/                             # Admin panel route group
│   │   ├── about/                         # About section management page
│   │   ├── blog/                          # Blog post management with markdown editor
│   │   ├── dashboard/                     # Admin dashboard overview
│   │   ├── education/                     # Education management page
│   │   ├── engineering-highlights/        # Engineering highlights management page
│   │   ├── experience/                     # Experience management page
│   │   ├── login/                         # Admin login page with account lockout UI
│   │   ├── messages/                      # Contact messages inbox with read status
│   │   ├── projects/                      # Projects management with case study fields
│   │   ├── skills/                        # Skills management with categories
│   │   ├── layout.tsx                     # Admin layout with sidebar
│   │   └── page.tsx                       # Admin dashboard entry
│   ├── api/
│   │   ├── admin/                         # Admin API endpoints
│   │   │   ├── about/                     # About CRUD + avatar upload
│   │   │   ├── blog/                      # Blog CRUD + image management
│   │   │   ├── csrf/                      # CSRF token generation/validation
│   │   │   ├── education/                 # Education CRUD + reordering
│   │   │   ├── engineering-highlights/    # Engineering highlights CRUD + reordering
│   │   │   ├── experience/                # Experience CRUD + reordering
│   │   │   ├── messages/                  # Contact messages management
│   │   │   ├── projects/                  # Projects CRUD + images + toggles (featured/visibility)
│   │   │   ├── skills/                    # Skills CRUD + reordering + visibility + categories + toggle
│   │   │   └── upload/                    # Image upload to ImageKit with rate limiting
│   │   ├── auth/[...nextauth]/            # NextAuth authentication route
│   │   ├── contact/                       # Public contact form with CSRF + rate limiting
│   │   └── engineering-highlights/        # Public engineering highlights endpoint
│   ├── globals.css                       # Global Tailwind CSS styles
│   ├── layout.tsx                        # Root layout with providers (theme, locale)
│   ├── robots.ts                         # Robots.txt configuration
│   └── sitemap.ts                        # Dynamic sitemap with blog posts
├── components/
│   ├── admin/                            # Admin-specific components
│   │   ├── AdminLayoutWrapper.tsx          # Admin layout wrapper component
│   │   ├── AdminMobileHeader.tsx          # Mobile header with hamburger menu
│   │   ├── AdminSidebar.tsx               # Sidebar navigation with user profile
│   │   └── index.ts                      # Admin component exports
│   ├── public/                           # Public-facing components
│   │   ├── AboutSection.tsx               # About section with avatar and social links
│   │   ├── BackToTopButton.tsx            # Scroll to top button
│   │   ├── BlogSection.tsx                # Blog section with featured posts
│   │   ├── CaseStudyModal.tsx             # Modal for detailed project case studies
│   │   ├── ContactSection.tsx             # Contact form with CSRF token
│   │   ├── EducationSection.tsx           # Education timeline section
│   │   ├── EngineeringHighlightsSection.tsx # Engineering highlights grid
│   │   ├── ExperienceSection.tsx          # Work experience timeline
│   │   ├── GitHubStatsSection.tsx         # GitHub statistics display
│   │   ├── HeroSection.tsx                # Hero section with CTA
│   │   ├── ImageCarousel.tsx              # Image carousel with thumbnails
│   │   ├── LanguageToggle.tsx             # Language switcher (EN/TH)
│   │   ├── Navbar.tsx                     # Navigation bar with theme toggle
│   │   ├── ProjectsSection.tsx            # Projects grid with case study modals
│   │   ├── ScrollProgressBar.tsx          # Reading progress indicator
│   │   ├── ScrollToContactButton.tsx      # Floating contact button
│   │   ├── SkillsSection.tsx              # Skills grouped by category
│   │   ├── ThemeToggle.tsx                # Dark/light theme toggle
│   │   └── index.ts                      # Public component exports
│   ├── ui/                               # shadcn/ui components (button, input, card, dialog, etc.)
│   ├── ErrorBoundary.tsx                  # React error boundary wrapper
│   ├── LocaleProvider.tsx                # i18n locale context provider
│   ├── MermaidDiagram.tsx                # Mermaid diagram renderer
│   ├── theme-provider.tsx                 # Theme provider (dark/light mode)
│   └── WebVitals.tsx                     # Web vitals reporting
├── hooks/
│   └── useLocale.ts                      # Locale hook for i18n
├── lib/
│   ├── actions/                          # Server actions
│   │   ├── github.ts                     # GitHub stats fetching (server action)
│   │   └── index.ts                      # Login/logout server actions
│   ├── auth.ts                           # NextAuth configuration with Credentials provider
│   ├── csrf-client.ts                    # Client-side CSRF utilities
│   ├── csrf.ts                           # CSRF token generation/validation (httpOnly + public)
│   ├── db.ts                             # Prisma client singleton with Neon adapter
│   ├── edge-auth.ts                      # Edge-compatible auth utilities
│   ├── env.ts                            # Environment variable validation with Zod
│   ├── i18n/                             # Internationalization
│   │   ├── admin/                        # Admin translations (en.json, th.json)
│   │   ├── common/                       # Common translations (en.json, th.json)
│   │   ├── index.ts                      # i18n client utilities
│   │   └── server.ts                     # i18n server utilities
│   ├── rate-limit.ts                     # Upstash Redis rate limiting with in-memory fallback
│   ├── sanitize.ts                       # HTML/text sanitization (sanitize-html)
│   ├── utils.ts                          # Utility functions (cn for className merging)
│   ├── validations/                      # Zod validation schemas
│   │   └── index.ts                      # All schemas (login, password, about, skill, project, etc.)
│   ├── web-vitals.ts                     # Web vitals utilities
│   └── index.ts                          # Library exports
├── proxy.ts                             # Next.js middleware for auth protection
├── scripts/                             # Utility scripts directory
└── types/                               # TypeScript type definitions
    ├── index.ts                          # Type exports
    └── next-auth.d.ts                    # NextAuth type extensions
```

---

## 🗃️ Database Schema

| Model                | Description                                                                                                                                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `About`              | Personal information with name, title, bio, avatar URL, resume URL, GitHub/LinkedIn URLs, email, phone, location, status, availability, years of experience, strengths, goals, and current learning (with Thai translations) |
| `Skill`              | Skills with category, name, icon URL, proficiency level (0-100), sort order, and visibility flag (with Thai translations)                                                                                                                  |
| `Project`            | Portfolio projects with title, description, long description, tech stack array, GitHub URL, live URLs array, featured flag, visibility flag, sort order, case study fields (problem, solution, challenges, results, architecture diagram, tech stack used, timeline, team size, key learnings) with Thai translations |
| `ProjectImage`       | Multiple images per project with URL and sort order                                                                                                                                                                                       |
| `Experience`         | Work experience with company, position, description, start/end dates, current job flag, and sort order (with Thai translations)                                                                                                           |
| `Education`          | Education history with degree, institution, field of study, GPA, description, start/end dates, and sort order (with Thai translations)                                                                                                   |
| `BlogPost`           | Blog posts with title, slug, excerpt, content (markdown), tags array, published flag, featured flag, reading time, publication date, and images (with Thai translations)                                                                     |
| `BlogImage`          | Multiple images per blog post with URL and sort order                                                                                                                                                                                     |
| `ContactMessage`     | Contact form submissions with name, email, subject, message, read status flag, and creation timestamp                                                                                                                                       |
| `AdminUser`          | Admin users with username (unique), password hash (bcrypt), failed attempts counter, lockout timestamp, and creation timestamp                                                                                                            |
| `EngineeringHighlight` | Engineering highlights with title, icon, sort order, and visibility flag (with Thai translations)                                                                                                                                      |

---

## 🔄 System Flow

## 01 · Authentication

```
User → Login Page → POST /api/auth/[...nextauth]/callback/credentials
                                      ↓
                              Check Rate Limit (login:username)
                                      ↓
                              Check Account Lockout (lockedUntil > now?)
                                      ↓
                              bcrypt.compare() Password
                                      ↓
                              Success → Reset failedAttempts → JWT Session (24h max)
                              Failure → Increment failedAttempts → Lock if >= 5
                                      ↓
                              Redirect to /admin/dashboard
```

- **Admin Login**: Username/password authentication via NextAuth Credentials provider
- **Account Lockout**: After 5 failed attempts, account locked for 15 minutes with countdown display
- **Session Strategy**: JWT with 24-hour max age stored in httpOnly cookie
- **Failed Attempts Tracking**: Resets on successful login, increments on failure
- **Rate Limiting**: Per-username rate limiting on login attempts via Upstash Redis

| Status | Description                                    |
| ------ | ---------------------------------------------- |
| Active | User can login normally                        |
| Locked | Account locked due to too many failed attempts |

---

## 02 · Public Visitor Flow

```
Visitor → Homepage → View Sections (Hero, About, Engineering Highlights, Skills, Projects, Experience, Education, Blog, GitHub Stats, Contact)
         ↓
    Read Blog Post → /blog/[slug] → Markdown rendering with syntax highlighting
         ↓
    View Project Case Study → Click "View Case Study" → Modal with problem/solution/challenges/results/diagram
         ↓
    Contact Form → GET /api/contact (CSRF token) → POST with CSRF → Rate Limit (IP + email) → Save to DB → EmailJS Notification
         ↓
    Toggle Language → EN/TH switch → Locale context updates → Re-render with translated content
         ↓
    Toggle Theme → Dark/Light mode → next-themes context → localStorage persistence
```

- **View Portfolio**: Public access to all portfolio sections with ISR caching (3600s)
- **Read Blog**: View published blog posts with markdown rendering, syntax highlighting, and images
- **Case Studies**: Detailed project information in modal with Mermaid diagram rendering
- **Contact Form**: Submit messages with dual rate limiting (IP-based: 60/min, email-based: 60/min)
- **Bilingual Switching**: Toggle between English and Thai with locale-aware content
- **GitHub Stats**: Display commit counts, contributions, repositories, and top languages (cached 1 hour)
- **SEO**: Auto-generated sitemap includes all published blog posts

---

## 03 · Admin Flow

```
Admin → Login → Dashboard
         ↓
    Manage Content:
         ├── About → Update personal info, upload avatar to ImageKit
         ├── Skills → CRUD, reorder (drag-and-drop), toggle visibility, manage categories
         ├── Projects → CRUD, upload images (ImageKit), toggle featured/visibility, reorder, edit case study fields
         ├── Experience → CRUD, reorder (drag-and-drop)
         ├── Education → CRUD, reorder (drag-and-drop)
         ├── Engineering Highlights → CRUD, reorder (drag-and-drop), toggle visibility
         ├── Blog → CRUD with markdown editor, publish/unpublish, manage images, set reading time
         └── Messages → View contact submissions, mark as read/unread
         ↓
    All Mutations → CSRF Validation → Rate Limit (upload: 30/min) → revalidatePath("/") → Cache Invalidation
```

- **Dashboard**: Overview with navigation to all content sections
- **CRUD Operations**: Create, read, update, delete for all content types
- **Image Upload**: Upload to ImageKit with file-type validation and rate limiting
- **Reordering**: Drag-and-drop sort using @dnd-kit for skills, projects, experience, education, engineering highlights
- **Toggles**: Featured projects, skill visibility, blog publishing status
- **Messages**: View contact submissions with read/unread status tracking
- **Markdown Editor**: Blog content editing with @uiw/react-md-editor
- **CSRF Protection**: All admin mutations require valid CSRF token (rotated after validation)

| Content Type           | Actions                                                                 |
| ---------------------- | ----------------------------------------------------------------------- |
| About                  | Update info, upload avatar                                              |
| Skills                 | CRUD, reorder, toggle visibility, manage categories                     |
| Projects               | CRUD, upload images, toggle featured/visibility, reorder, case studies  |
| Experience             | CRUD, reorder                                                           |
| Education              | CRUD, reorder                                                           |
| Engineering Highlights | CRUD, reorder, toggle visibility                                        |
| Blog                   | CRUD with markdown, publish/unpublish, manage images, reading time     |
| Messages               | View, mark as read/unread                                               |

---

## 💾 Caching Strategy

| Tag pattern | Scope    | Revalidated on                                          |
| ----------- | -------- | ------------------------------------------------------- |
| `/`         | Homepage | All content updates via `revalidatePath("/")`           |
| `3600s`     | Homepage | Time-based ISR revalidation (1 hour)                    |
| GitHub API  | Stats    | Next.js `revalidate: 3600` (1 hour)                    |

**Implementation**: Next.js ISR with `export const revalidate = 3600` on homepage. All admin content mutations call `revalidatePath("/")` to invalidate the homepage cache immediately. GitHub stats use Next.js fetch with `revalidate: 3600`.

---

## 🔐 Security

- **Authentication**: NextAuth v5 with JWT session strategy (24-hour max age)
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Zod schemas for all API endpoints (login, password strength, content fields)
- **CSRF Protection**: Token-based CSRF validation with UUID tokens; admin endpoints use httpOnly cookies with rotation, public forms use non-httpOnly tokens
- **Rate Limiting**: Upstash Redis with sliding window (60 req/min for API, 30 req/min for uploads) with in-memory Map fallback for development; fail-closed on rate limiter failure in production
- **Account Lockout**: Automatic lockout after 5 failed login attempts (15 minutes) with countdown display
- **XSS Prevention**: sanitize-html for text content (strips all HTML), DOMPurify for rich text content (allows basic formatting tags)
- **Environment Validation**: Zod-based env variable validation at build time and runtime with `STRICT_ENV_VALIDATION` flag
- **Secure Cookies**: httpOnly, secure (production), sameSite=strict for CSRF tokens and NextAuth sessions
- **File Upload Validation**: file-type validation using file-type library, ImageKit upload rate limiting
- **Route Protection**: Next.js middleware (`proxy.ts`) protects `/admin/*` routes with session verification
- **Fail-Closed**: Rate limiter blocks requests on failure in production; in-memory fallback only in development
- **robots.txt**: Disallows crawling of `/admin/` and `/api/` routes

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon serverless recommended)
- ImageKit account (for image storage)
- Upstash Redis account (for production rate limiting)
- EmailJS account (optional, for contact form notifications)
- GitHub personal access token (optional, for GitHub stats)

### Installation

```bash
# Clone the repository
git clone https://github.com/patsarun2545/portfolio-next.git
cd portfolio-next

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

Open [http://localhost:3000](http://localhost:3000) to view the portfolio. Admin panel at `/admin/login`.

### Environment Variables

```env
# Database (PostgreSQL with Neon)
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/portfolio?sslmode=require

# NextAuth
NEXTAUTH_SECRET=your-generated-secret-here-run-openssl-rand-base64-32
NEXTAUTH_URL=https://your-domain.vercel.app

# CORS
ALLOWED_ORIGINS=https://your-domain.vercel.app

# ImageKit (Image Storage)
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

# GitHub (GitHub Stats)
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_USERNAME=patsarun2545
```

### Run Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:migrate   # Run database migrations
npm run db:generate  # Generate Prisma client
npm run db:seed      # Seed database with initial data
```

---

## 👤 Author

**Patsarun Kathinthong**

- Full Stack Developer · Next.js / PERN Stack
- 📧 patsarun2545@gmail.com
- 🔗 [github.com/patsarun2545](https://github.com/patsarun2545)
