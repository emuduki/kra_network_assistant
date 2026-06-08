# KRA AI Network Incident Assistant

An internal AI-powered web tool that helps KRA ICT staff diagnose and fix VPN and network incidents faster using Claude AI.

---

## Tech Stack

| Layer      | Technology                        | Deploy        |
|------------|-----------------------------------|---------------|
| Frontend   | React 18 + Vite + Zustand         | Vercel        |
| Backend    | Node.js + Express                 | Railway       |
| Database   | PostgreSQL 15                     | Render        |
| AI         | Anthropic Claude (claude-sonnet)  | API           |
| Dev infra  | Docker + Docker Compose           | Local         |

---

## Quick Start (Local — Docker)

**Prerequisites**: Docker Desktop installed and running.

```bash
# 1. Clone the repo
git clone https://github.com/your-org/kra-network-assistant
cd kra-network-assistant

# 2. Copy and configure env files
cp backend/.env.example backend/.env
# Open backend/.env and set your ANTHROPIC_API_KEY

# 3. Start everything (backend + postgres)
docker-compose up --build

# 4. In a separate terminal, start the frontend
cd frontend
npm install
npm run dev

# 5. Open the app
# Frontend:  http://localhost:3000
# Backend:   http://localhost:4000
# API check: http://localhost:4000/health
```

---

## Quick Start (Local — No Docker)

**Prerequisites**: Node.js 18+, PostgreSQL 15 installed locally.

```bash
# 1. Create the database
psql -U postgres -c "CREATE DATABASE kra_network;"
psql -U postgres -c "CREATE USER kra_user WITH PASSWORD 'secret';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE kra_network TO kra_user;"

# 2. Run migrations
psql -U kra_user -d kra_network -f docker/postgres/init.sql

# 3. Start backend
cd backend
npm install
cp .env.example .env   # then set ANTHROPIC_API_KEY
npm run dev            # runs on http://localhost:4000

# 4. Start frontend (new terminal)
cd frontend
npm install
npm run dev            # runs on http://localhost:3000
```

---

## Default Login Credentials (dev only)

| Name       | Email                  | Password  | Role         |
|------------|------------------------|-----------|--------------|
| J. Kariuki | kariuki@kra.go.ke      | kra2026!  | admin        |
| A. Omondi  | omondi@kra.go.ke       | kra2026!  | ict_officer  |
| M. Wangari | wangari@kra.go.ke      | kra2026!  | ict_officer  |

> ⚠️ Change all passwords before deploying to production.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable           | Description                              |
|--------------------|------------------------------------------|
| `PORT`             | API server port (default: 4000)          |
| `DB_HOST`          | PostgreSQL host                          |
| `DB_NAME`          | Database name                            |
| `DB_USER`          | Database user                            |
| `DB_PASSWORD`      | Database password                        |
| `DATABASE_URL`     | Full connection string (Railway/Render)  |
| `JWT_SECRET`       | Long random string for signing tokens    |
| `ANTHROPIC_API_KEY`| Your Anthropic API key                   |
| `CORS_ORIGINS`     | Comma-separated allowed frontend origins |

### Frontend (`frontend/.env`)

| Variable       | Description              |
|----------------|--------------------------|
| `VITE_API_URL` | Backend API base URL     |

---

## Project Structure

```
kra-network-assistant/
├── frontend/           React + Vite (Vercel)
│   └── src/
│       ├── components/ Shared UI: Badge, Card, NavBar, Logo
│       ├── pages/      One file per route/view
│       ├── services/   API call functions (axios)
│       ├── store/      Zustand global state
│       └── styles/     KRA design tokens CSS
├── backend/            Node.js + Express (Railway)
│   └── src/
│       ├── routes/     REST endpoint definitions
│       ├── controllers/Business logic
│       ├── services/   Claude AI integration
│       ├── middleware/ Auth, rate limiting, errors
│       └── db/         Pool + SQL migrations
├── docker/
│   └── postgres/init.sql  Schema + seed data
├── docker-compose.yml
└── README.md
```

---

## API Endpoints

| Method | Path                  | Auth | Description                  |
|--------|-----------------------|------|------------------------------|
| POST   | /api/auth/login       | No   | Login, returns JWT           |
| GET    | /api/incidents        | Yes  | List incidents                |
| POST   | /api/incidents        | Yes  | Create incident               |
| PATCH  | /api/incidents/:id    | Yes  | Update status/assignment      |
| GET    | /api/tunnels          | Yes  | List VPN tunnels              |
| POST   | /api/ai/analyze       | Yes  | AI log analysis               |
| POST   | /api/ai/chat          | Yes  | AI chat assistant             |
| GET    | /api/logs             | Yes  | Past log submissions          |
| GET    | /health               | No   | Health check                  |

---

## Build Phases

| Phase | What                              | When    |
|-------|-----------------------------------|---------|
| 1     | Setup & scaffolding (this)        | Wk 1–2  |
| 2     | Backend API + DB + Claude service | Wk 2–3  |
| 3     | Frontend — all pages wired to API | Wk 3–5  |
| 4     | Docker + Vercel/Railway deploy    | Wk 5–6  |

---

## Team Division of Work

| Area          | Files                                    |
|---------------|------------------------------------------|
| UI/Frontend   | `frontend/src/pages/`, `components/`     |
| Backend/API   | `backend/src/routes/`, `controllers/`    |
| AI Integration| `backend/src/services/claude.service.js` |
| Database      | `backend/src/db/`, `docker/postgres/`    |
| DevOps        | `docker-compose.yml`, `Dockerfile`       |
