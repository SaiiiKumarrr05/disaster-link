# DisasterLink AI

DisasterLink AI is an emergency response platform for disaster situations — built to let citizens raise an SOS, find the nearest shelter, hospital, or police station, get bilingual emergency guidance, and stay informed via official alerts, while giving rescue teams and authorities a live triage queue to act on.

It's designed around one rule: **nothing that could save a life should require a login.** SOS reporting, alerts, shelter lookup, and emergency contacts are all public endpoints. Authentication only gates the things that need accountability — publishing alerts, and managing the rescue queue.

## Features

- **One-tap SOS reporting** — citizens (anonymous or logged in) submit an SOS with just a location. Category (medical, trapped, fire, flood, other) auto-assigns a priority, and every status change is written to an audit history.
- **Rescue/authority dashboard** — a priority-sorted queue (critical first, then oldest-first) with one-tap status transitions (`submitted → acknowledged → en_route → resolved/cancelled`), live queue stats, and average response time tracking.
- **Shelter / hospital / police finder** — public, location-based lookup within a configurable radius, sorted by distance.
- **Official alerts** — public alert feed filterable by state and severity, with supporting risk indicators. Only verified Authority/Admin accounts can publish alerts.
- **Bilingual emergency assistant** (English/Hindi) — keyword-routed guidance for earthquakes, floods, gas leaks, cyclones, being trapped, and first aid. Deliberately rule-based rather than LLM-generated, since the guidance steps need to be exact and government-approved, not "probably right."
- **Emergency contacts directory** — national numbers (police, ambulance, disaster helpline, NDRF) plus state/district-specific contacts.
- **Role-based access** — `citizen`, `rescue_team`, `authority`, and `admin` roles, with JWT-based auth.

## Tech stack

**Backend** — FastAPI, SQLAlchemy, Pydantic v2, JWT auth (`python-jose`), password hashing (`passlib` + `bcrypt`), PostgreSQL in production (Supabase-targeted) with SQLite for local development.

**Frontend** — React 18 + Vite, React Router, Tailwind CSS, Leaflet / React-Leaflet for maps, Lucide icons.

## Project structure

```
disaster-link/
├── backend/
│   ├── app/
│   │   ├── core/        # config, security, auth dependencies
│   │   ├── db/          # database session/engine
│   │   ├── models/      # SQLAlchemy models + enums
│   │   ├── routers/     # auth, alerts, places, sos, emergency_contacts, assistant
│   │   ├── schemas/     # Pydantic request/response schemas
│   │   ├── services/
│   │   └── main.py      # FastAPI app entrypoint
│   ├── requirements.txt
│   └── tests/
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── hooks/
    │   ├── locales/     # EN/HI translations
    │   ├── pages/        # Landing, Login, Menu, Dashboard, SOS, ShelterFinder, Assistant, RescueDashboard
    │   ├── services/     # API client
    │   ├── styles/
    │   └── utils/
    ├── package.json
    └── vite.config.js
```

## Getting started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 

### Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/` (see [Environment variables](#environment-variables) below), then run:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`, with interactive Swagger docs at `http://localhost:8000/docs` and a health check at `GET /api/health`.

### Frontend setup

```bash
cd frontend
npm install
cp .env.example .env     
npm run dev
```

The app will be available at `http://localhost:5173`.

## Environment variables

**Backend** (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `database_url` | `postgresql://postgres:postgres@localhost:5432/disasterlink` | Database connection string |
| `jwt_secret` | `CHANGE_ME_IN_PRODUCTION` | Secret used to sign JWTs — **must** be overridden outside local dev |
| `jwt_algorithm` | `HS256` | JWT signing algorithm |
| `access_token_expire_minutes` | `1440` (24h) | Token lifetime — kept long so field workers aren't forced to re-login mid-response |
| `allowed_origins` | `["http://localhost:5173", "http://localhost:3000"]` | CORS allow-list |
| `sos_critical_response_minutes` | `10` | SLA threshold used to flag overdue critical SOS cases on the rescue dashboard |

**Frontend** (`frontend/.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Base URL of the backend API |

## API overview

All routes are prefixed with `/api`.

| Area | Endpoint | Auth |
|---|---|---|
| Auth | `POST /auth/signup`, `POST /auth/login`, `GET /auth/me` | Public / Bearer token |
| Alerts | `GET /alerts`, `GET /alerts/{id}`, `GET /alerts/{id}/risk-indicators` | Public |
| Alerts | `POST /alerts` | Authority / Admin |
| Places | `GET /places?lat=&lng=&place_type=&radius_km=` | Public |
| SOS | `POST /sos`, `GET /sos/{id}`, `PATCH /sos/{id}` | Public (anonymous-friendly) |
| SOS | `GET /sos`, `GET /sos/stats/summary`, `PATCH /sos/{id}/status`, `GET /sos/{id}/history` | Rescue team / Authority / Admin |
| Emergency contacts | `GET /emergency-contacts?state=&district=` | Public |
| Assistant | `GET /assistant/topics`, `GET /assistant/topics/{topic_key}` | Public |
| Health | `GET /health` | Public |

Full request/response schemas are available via the auto-generated Swagger UI at `/docs` once the backend is running.

## User roles

| Role | Capabilities |
|---|---|
| `citizen` | Submit/track SOS requests, view alerts, find shelters, use the assistant |
| `rescue_team` | Everything above, plus the rescue queue, status updates, and queue stats |
| `authority` | Everything above, plus publishing official alerts |
| `admin` | Full access |

## Notes

- `disasterlink.db` is a local SQLit



