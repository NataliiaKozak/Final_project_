# ICHGRAMM

Fullstack Instagram-clone: feed, likes, comments, follows, real-time messaging, notifications, search, image upload (Cloudinary / AWS S3), dark/light theme.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 7, Redux Toolkit, TypeScript, CSS Modules |
| **Backend** | Express 5, TypeScript, Mongoose (MongoDB), Socket.IO |
| **Storage** | Cloudinary or AWS S3 (configurable via `STORAGE_PROVIDER`) |
| **Auth** | JWT (access + reset tokens), bcrypt password hashing |
| **Validation** | Zod schemas on auth, comment, message routes + ObjectId validation |
| **Security** | Helmet, CORS, express-rate-limit, requireEnv() for secrets |
| **Logging** | Winston (structured JSON logging) |
| **SEO** | react-helmet-async, Open Graph meta tags |
| **Testing** | Jest + Supertest (32 tests) |
| **DevOps** | Docker multi-stage builds, docker-compose, nginx (production) |

## Features

- User registration / login / password reset (email via Nodemailer)
- Create, edit, delete posts with image upload (sharp optimization)
- Like / unlike posts and comments with real-time notifications
- Comment system with nested likes
- Follow / unfollow users
- User profile with avatar, bio, website, post/follower/following stats
- Real-time messaging via Socket.IO with unread message badge
- Search users
- Notifications (likes, comments, follows)
- Explore page with random posts
- Dark / light theme toggle with system preference detection
- Responsive design (desktop / tablet / mobile with burger menu at <567px)
- Pagination on posts and messages
- Health check endpoint (`GET /health`)

## Project Structure

```
Final_project_/
├── BE/                         # Backend (Express + TypeScript)
│   ├── app.ts                  # Express app: middleware, routes, error handling
│   ├── server.ts               # HTTP server + Socket.IO (rooms, messaging)
│   ├── src/
│   │   ├── config/             # DB, env, JWT, logger, storage (S3/Cloudinary)
│   │   ├── controllers/        # Route handlers (auth, user, post, like, comment, follow, message, notification, search)
│   │   ├── middlewares/        # Auth (JWT), rate limiter, Zod validation
│   │   ├── models/             # Mongoose schemas (User, Post, Comment, Like, Follow, Message, Notification)
│   │   ├── routes/             # Express routers
│   │   ├── utils/              # Helpers (toErrorMessage, populatedUser)
│   │   ├── validation/         # Zod schemas (authSchemas, commonSchemas)
│   │   └── __tests__/          # Jest + Supertest tests
│   ├── Dockerfile              # Multi-stage (dev / build / production)
│   ├── jest.config.ts          # Jest configuration
│   └── .env.example            # Environment variable template
├── FE/                         # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/         # UI components (navigation, profiles, posts, messages, search, etc.)
│   │   ├── pages/              # Page components (Home, Explore, Messages, Profile, etc.)
│   │   ├── redux/              # Redux Toolkit store, slices, hooks
│   │   ├── api/                # Axios instance, Socket.IO client
│   │   ├── interfaces/         # TypeScript interfaces
│   │   └── global.css          # CSS variables, reset, theme (light/dark)
│   ├── Dockerfile              # Multi-stage (dev / build / nginx production)
│   └── nginx.conf              # Production: SPA fallback + API/WebSocket proxy
├── docker-compose.yml          # Development environment
├── docker-compose.prod.yml     # Production environment
└── README.md
```

## Security

- **Helmet** — HTTP security headers
- **CORS** — strict origin policy (`CLIENT_URL` only)
- **Rate limiting** — express-rate-limit on all API routes
- **JWT** — access tokens with configurable expiration; separate `JWT_RESET_SECRET` for password resets
- **requireEnv()** — server won't start without `MONGO_URI`, `JWT_SECRET`, `JWT_RESET_SECRET`
- **Zod validation** — request body validation on auth, comment, and message routes
- **ObjectId validation** — all controllers validate MongoDB ObjectId params (returns 400 for invalid IDs)
- **bcrypt** — password hashing with 10 salt rounds
- **Input limits** — post description (200 chars), comment (500 chars), message (2000 chars)
- **Docker secrets** — `env_file` in docker-compose, no hardcoded credentials

## Quick Start (Local Development)

### Prerequisites

- Node.js 20+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (or AWS S3)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2. Backend setup

```bash
cd BE
cp .env.example .env
# Edit .env: fill in MONGO_URI, JWT_SECRET, JWT_RESET_SECRET, Cloudinary/S3 credentials
npm install
npm run dev
```

Backend runs on `http://localhost:3000`.

### 3. Frontend setup

```bash
cd FE
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

### 4. Run tests

```bash
cd BE
npm test
```

32 tests covering health, auth validation, Zod schemas, protected routes, and ObjectId validation.

## Docker Development

```bash
# From the project root (where docker-compose.yml is located)
docker-compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Health check: `http://localhost:3000/health`

## Production Deployment

### Option 1: Docker Compose (VPS / Cloud VM)

```bash
# 1. Configure environment
cp BE/.env.example BE/.env
# Edit BE/.env with production values:
#   NODE_ENV=production
#   MONGO_URI=<production MongoDB URI>
#   JWT_SECRET=<strong random string, 32+ chars>
#   JWT_RESET_SECRET=<strong random string, 32+ chars>
#   CLIENT_URL=https://yourdomain.com
#   STORAGE_PROVIDER=cloudinary
#   + storage credentials

# 2. Build and run
docker-compose -f docker-compose.prod.yml up --build -d

# 3. Verify
curl http://localhost:3000/health
# Frontend served via nginx on port 80
```

**Production architecture:**
- **Backend** — Node.js production build (`node dist/server.js`), port 3000, runs as non-root `node` user
- **Frontend** — nginx serving static files on port 80:
  - SPA fallback (`try_files $uri /index.html`)
  - API reverse proxy (`/api/` → backend:3000)
  - WebSocket proxy (`/socket.io/` → backend:3000)
  - Static asset caching (1 year, immutable)
- Health checks on both containers (30s interval)

### Option 2: Manual Deployment

```bash
# Backend
cd BE
npm ci
npm run build          # TypeScript → dist/
NODE_ENV=production node dist/server.js

# Frontend
cd FE
npm ci
npm run build          # Vite → dist/
# Serve dist/ with nginx, Vercel, Netlify, etc.
```

### Option 3: GitHub Monorepo — Platform Deployments

Since the repo is a monorepo with `BE/` and `FE/` folders:

**Render / Railway / Fly.io (full-stack):**
- Create two services from the same repo
- Backend service: root directory = `BE`, build = `npm run build`, start = `node dist/server.js`
- Frontend service: root directory = `FE`, build = `npm run build`, publish = `dist`

**Vercel (FE only) + Render (BE):**
- Vercel: root = `FE`, build = `npm run build`, output = `dist`
- Add env var `VITE_API_URL=https://your-backend.onrender.com/api`

## Environment Variables (BE)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGO_URI` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | Yes | — | Secret for access tokens |
| `JWT_RESET_SECRET` | Yes | — | Secret for password reset tokens |
| `PORT` | No | 3000 | Server port |
| `CLIENT_URL` | No | http://localhost:5173 | Frontend URL for CORS |
| `NODE_ENV` | No | development | Environment mode |
| `STORAGE_PROVIDER` | No | s3 | `cloudinary` or `s3` |
| `CLOUDINARY_CLOUD_NAME` | If cloudinary | — | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | If cloudinary | — | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | If cloudinary | — | Cloudinary API secret |
| `AWS_ACCESS_KEY_ID` | If s3 | — | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | If s3 | — | AWS secret key |
| `AWS_REGION` | If s3 | — | AWS region |
| `S3_BUCKET_NAME` | If s3 | — | S3 bucket name |
| `EMAIL_HOST` | No | smtp.gmail.com | SMTP host |
| `EMAIL_PORT` | No | 587 | SMTP port |
| `EMAIL_USER` | No | — | SMTP username |
| `EMAIL_PASS` | No | — | SMTP password |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register (Zod validated) |
| POST | `/api/auth/login` | No | Login (Zod validated) |
| POST | `/api/auth/forgot-password` | No | Request password reset |
| POST | `/api/auth/reset-password` | No | Reset password with token |
| GET | `/api/users/:id` | Yes | Get user profile + stats |
| PUT | `/api/users/profile` | Yes | Update own profile (multipart) |
| GET | `/api/posts` | Yes | Get all posts (paginated) |
| GET | `/api/posts/:id` | Yes | Get post by ID |
| POST | `/api/posts` | Yes | Create post (multipart) |
| PUT | `/api/posts/:id` | Yes | Update own post |
| DELETE | `/api/posts/:id` | Yes | Delete own post |
| GET | `/api/posts/explore` | No | Random posts for explore |
| GET | `/api/posts/user/:userId` | Yes | Posts by user |
| POST | `/api/likes/post/:postId` | Yes | Toggle post like |
| POST | `/api/likes/comment/:commentId` | Yes | Toggle comment like |
| GET | `/api/comments/post/:postId` | No | Get post comments |
| POST | `/api/comments/:postId` | Yes | Add comment (Zod validated) |
| DELETE | `/api/comments/:commentId` | Yes | Delete own comment |
| POST | `/api/follows/:userId` | Yes | Follow user |
| DELETE | `/api/follows/:userId` | Yes | Unfollow user |
| GET | `/api/follows/:userId/followers` | No | Get followers |
| GET | `/api/follows/:userId/following` | No | Get following |
| POST | `/api/messages` | Yes | Send message (Zod validated) |
| GET | `/api/messages` | Yes | Get all conversations |
| GET | `/api/messages/:userId` | Yes | Message history (paginated) |
| GET | `/api/search?q=` | No | Search users |
| GET | `/api/notifications` | Yes | Get notifications |
| GET | `/health` | No | Health check |

**Socket.IO events:** `joinRoom`, `sendMessage` → `receiveMessage`

## Testing

```bash
cd BE
npm test
```

**32 tests** across 3 suites:

| Suite | Tests | What it covers |
|-------|-------|---------------|
| `health.test.ts` | 2 | Health endpoint, 404 handler |
| `auth.test.ts` | 10 | Registration/login validation, protected routes (401), ObjectId validation |
| `validation.test.ts` | 20 | All Zod schemas: register, login, forgotPassword, resetPassword, objectId, addComment, sendMessage |

**Extending tests:**
- Integration tests: install `mongodb-memory-server` for in-memory MongoDB
- FE tests: `@testing-library/react` + `vitest`
- E2E: Playwright (register → login → create post → like → logout)

## License

ISC
