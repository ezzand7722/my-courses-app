# منصة الدورات التعليمية المجانية 🎓

A free Arabic-first video course platform built on Cloudflare's edge infrastructure.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14+ (App Router) + TypeScript + Tailwind CSS |
| Backend | Next.js API Routes (Edge Runtime) |
| Database | Cloudflare D1 (SQLite at the edge) |
| Video | Cloudflare Stream (TUS upload + adaptive HLS player) |
| Storage | Cloudflare R2 (images, thumbnails) |
| Auth | Custom JWT (jose) + bcrypt passwords, httpOnly cookie |
| Deploy | Cloudflare Pages |

## Features

- ✅ **Full RTL Arabic UI** — Cairo font, right-to-left layout throughout
- ✅ **Anonymous student browsing** — No login required to watch videos
- ✅ **Teacher portal** — Dedicated login, dashboard, course/lesson management
- ✅ **Real video upload** — TUS resumable upload directly to Cloudflare Stream with live progress bar
- ✅ **Adaptive streaming** — Cloudflare Stream iframe player with automatic HLS bitrate adaptation
- ✅ **Course management** — Create, edit, publish/unpublish, delete courses
- ✅ **Lesson management** — Add lessons, drag-to-reorder, upload videos per lesson
- ✅ **Real search** — Full-text search against D1 database
- ✅ **Skeleton loaders** — Never blank white screens during data fetching
- ✅ **Mobile-first** — Responsive hamburger navigation, single-column mobile grids
- ✅ **Route protection** — Middleware-level auth guard for all `/teacher/*` routes

## Setup Instructions

### 1. Prerequisites

```bash
npm install -g wrangler@latest
wrangler login
```

### 2. Clone & Install

```bash
git clone <your-repo>
cd coursesproj
npm install
```

### 3. Create Cloudflare Resources

**D1 Database:**
```bash
wrangler d1 create coursesproj-db
# Copy the database_id output to wrangler.toml
```

**R2 Bucket:**
```bash
wrangler r2 bucket create coursesproj-media
```

**Cloudflare Stream:**
- Go to Cloudflare Dashboard → Stream
- Enable Stream on your account
- Create an API Token with scope: `Account > Cloudflare Stream > Edit`

### 4. Configure wrangler.toml

Update `wrangler.toml` with your actual `database_id`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "coursesproj-db"
database_id = "YOUR_ACTUAL_DATABASE_ID"
```

### 5. Run Database Migrations

```bash
# Local development
wrangler d1 migrations apply coursesproj-db --local

# Production
wrangler d1 migrations apply coursesproj-db --remote
```

### 6. Seed the Database

First generate a real bcrypt hash for the demo password:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('password123', 12).then(h => console.log(h));"
```

Replace `$2a$12$placeholder.hash.change.me.before.seeding` in `scripts/seed.sql` with the output, then:

```bash
# Local
wrangler d1 execute coursesproj-db --local --file=scripts/seed.sql

# Production
wrangler d1 execute coursesproj-db --remote --file=scripts/seed.sql
```

Demo accounts after seeding:
- **ahmad@demo.com** / password123 (teacher — Math & Physics courses)
- **sara@demo.com** / password123 (teacher — Chemistry & Biology courses)

### 7. Set Environment Secrets

```bash
# For Cloudflare Pages deployment
wrangler pages secret put JWT_SECRET
wrangler pages secret put CF_ACCOUNT_ID
wrangler pages secret put CF_STREAM_API_TOKEN
wrangler pages secret put R2_PUBLIC_DOMAIN  # optional

# For local development - copy and fill in:
cp .env.local.example .env.local
```

### 8. Local Development

```bash
npm run dev
# Opens at http://localhost:3000
```

> **Note:** For local dev with D1 bindings, use `wrangler pages dev` instead:
> ```bash
> npm run build
> wrangler pages dev .next/standalone -- --d1=DB=coursesproj-db
> ```

### 9. Deploy to Cloudflare Pages

```bash
# Connect repo to Cloudflare Pages via dashboard, OR:
wrangler pages project create coursesproj
wrangler pages deploy .vercel/output/static
```

**Build settings in Cloudflare Pages dashboard:**
- Build command: `npm run build`
- Build output directory: `.next`
- Node.js version: 20

### 10. Custom Domain

In Cloudflare Pages → Custom domains → add your domain.

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | ✅ | Strong random string (min 32 chars) for JWT signing |
| `CF_ACCOUNT_ID` | ✅ | Your Cloudflare account ID |
| `CF_STREAM_API_TOKEN` | ✅ | API token with Stream:Edit permission |
| `R2_PUBLIC_DOMAIN` | ⚪ | Custom domain for R2 public access (e.g. `pub-xxx.r2.dev`) |
| `NEXT_PUBLIC_BASE_URL` | ⚪ | Full URL of your site (for redirects) |

## Routes Reference

### Public Routes
| Path | Description |
|------|-------------|
| `/` | Homepage with featured courses and teachers |
| `/courses` | All published courses with subject filter |
| `/courses/[id]` | Course detail page with video player |
| `/teachers` | All teachers grid |
| `/teachers/[id]` | Teacher profile with their courses |
| `/search?q=...` | Search courses and teachers |

### Teacher Routes (Protected)
| Path | Description |
|------|-------------|
| `/teacher/login` | Login form |
| `/teacher/register` | Registration form |
| `/teacher/dashboard` | Course management dashboard |
| `/teacher/courses/new` | Create new course |
| `/teacher/courses/[id]/edit` | Edit course, manage lessons, upload videos |

### API Routes
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/courses` | List courses (supports `?subject=`, `?teacher_id=`, `?published=`) |
| POST | `/api/courses` | Create course (auth required) |
| GET | `/api/courses/[id]` | Course + lessons detail |
| PUT | `/api/courses/[id]` | Update course (owner only) |
| DELETE | `/api/courses/[id]` | Delete course (owner only) |
| GET | `/api/courses/[id]/lessons` | List lessons |
| POST | `/api/courses/[id]/lessons` | Add lesson (owner only) |
| PUT | `/api/courses/[id]/lessons/[lessonId]` | Update lesson |
| DELETE | `/api/courses/[id]/lessons/[lessonId]` | Delete lesson |
| GET | `/api/teachers` | All teachers with course counts |
| GET | `/api/teachers/[id]` | Teacher profile + their courses |
| GET | `/api/search?q=...` | Search courses and teachers |
| POST | `/api/auth/register` | Register teacher account |
| POST | `/api/auth/login` | Login and get session cookie |
| GET | `/api/auth/me` | Get current session user |
| POST | `/api/upload/stream` | Get Cloudflare Stream TUS upload URL |
| POST | `/api/upload/r2` | Upload image to R2 |

## Video Upload Flow

1. Teacher clicks "رفع فيديو" on a lesson
2. `UploadDropzone` calls `POST /api/upload/stream` with courseId
3. Server verifies teacher owns the course, calls Cloudflare Stream API to create a direct upload URL
4. Client uses `tus-js-client` to upload directly to Cloudflare Stream endpoint
5. Real-time progress bar shows bytes uploaded / total bytes
6. On completion, Stream returns the video UID
7. Client calls `PUT /api/courses/[id]/lessons/[lessonId]` to save the UID
8. Student-facing player embeds `https://iframe.videodelivery.net/[uid]` for adaptive HLS playback

## Section 7 Checklist Verification

- ✅ Every nav link routes somewhere real — no `href="#"`
- ✅ Teacher signup → login → dashboard works end-to-end with JWT session cookie
- ✅ Middleware redirects unauthenticated users from `/teacher/dashboard` and `/teacher/courses/*`
- ✅ Creating a course inserts a D1 row and immediately shows in dashboard
- ✅ Video upload uses tus-js-client → Cloudflare Stream TUS → stores UID in D1 lessons table
- ✅ Student: homepage → course → click lesson → iframe embed plays via Cloudflare Stream
- ✅ Search queries D1 with LIKE operators on title/description/subject
- ✅ All forms have Arabic validation errors and loading states
- ✅ Site is RTL, Arabic, light/modern design with Cairo font

## What's Not Yet Implemented

- Student accounts and progress tracking (tables exist in schema, but frontend flow is not built)
- Admin panel (role exists, but no separate admin UI)
- Email notifications
- Video processing webhooks (for setting duration after upload completes)

These were noted per your requirement to be explicit rather than stub silently.
