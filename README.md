# Scientific Collaboration Network Analyzer

A full-stack platform for researchers, institutions, and reviewers to manage research
profiles, publications, conferences, collaborations, and peer review — built with
**FastAPI**, **React**, and **PostgreSQL**.

Live features include role-based authentication with MFA, an AI-powered publication
summarizer, real-time-style chat between collaborators, and a full analytics/reporting
suite.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Database Schema (ER Diagram)](#database-schema-er-diagram)
5. [Roles & Access Model](#roles--access-model)
6. [Getting Started (Local Setup)](#getting-started-local-setup)
7. [Running with Docker](#running-with-docker)
8. [Environment Variables](#environment-variables)
9. [API Documentation](#api-documentation)
10. [Project Structure](#project-structure)
11. [AI Contributions](#ai-contributions)
12. [Screenshots](#screenshots)
13. [Known Limitations](#known-limitations)
14. [Future Scope](#future-scope)
15. [Contributors](#contributors)

---

## Features

### Authentication & Security
- JWT-based authentication with bcrypt password hashing
- **Email-based Multi-Factor Authentication (MFA)** — password + time-limited OTP sent to email
- **CAPTCHA** (Cloudflare Turnstile) on login and registration
- Role-based access control enforced server-side on every endpoint
- Researcher self-registration with Institution Admin approval workflow
- Forced password reset on first login for admin-created accounts (Institution Admin, Reviewer)

### Core Modules
- **User & Role Management** — System Admin, Institution Admin, Researcher, Reviewer
- **Institution & Department Management** — full CRUD, institution-scoped access
- **Researcher Profiles** — connected to institution and department via foreign keys
- **Publications** — 5 publication types, full lifecycle (Draft → Submitted → Under Review →
  Published/Rejected → Archived), file upload/download, co-author linking, DOI tracking
- **Peer Review** — dedicated Reviewer role claims and approves/rejects submissions with feedback
- **Conferences** — full event management, In-person/Online/Hybrid modes, registration
  (Attendee/Presenter), participant tracking
- **Collaboration Network** — send/accept/reject collaboration requests between researchers,
  linked optionally to a specific publication
- **In-app Chat** — real-time-style messaging (polling-based) between accepted collaborators,
  authorization enforced server-side
- **Citation Management** — track references per publication with live citation counts
- **Reports** — filterable researcher, publication, and conference reports, exportable as
  CSV, Excel, and PDF
- **Analytics Dashboard** — platform-wide stats, top researchers/institutions, recent
  publications, with bar and pie charts
- **Notifications** — in-app + email, covering collaboration requests, publication status
  changes, conference announcements, and chat messages
- **AI-Powered Publication Summaries** — Gemini API integration to auto-summarize publications

---

## Tech Stack

**Backend**
- FastAPI (Python) — REST API framework
- SQLAlchemy — ORM
- Alembic — database migrations
- PostgreSQL (hosted on [Neon](https://neon.tech)) — relational database
- Pydantic v2 — request/response validation
- passlib (bcrypt) — password hashing
- python-jose — JWT creation/verification
- fastapi-mail — email delivery (credentials, OTP, notifications)
- Cloudflare Turnstile — CAPTCHA verification
- Google Gemini API — AI publication summarization
- openpyxl / reportlab — Excel and PDF report generation

**Frontend**
- React 19 + Vite
- React Router v7
- Axios
- Recharts — analytics charts
- react-toastify — notifications UI
- @marsidev/react-turnstile — CAPTCHA widget
- Bootstrap (admin/management pages) + custom design system (dashboards, landing, auth)

**DevOps**
- Docker + Docker Compose (multi-container: backend, frontend)
- Nginx — serves the built React frontend
- Git/GitHub — version control

---

## Architecture

```mermaid
flowchart LR
    subgraph Client
        A[React Frontend<br/>Vite + Axios]
    end

    subgraph Backend["FastAPI Backend"]
        B[Routers / API Layer<br/>role guards, request validation]
        C[Service Layer<br/>business logic]
        D[SQLAlchemy ORM]
    end

    subgraph External["External Services"]
        E[(PostgreSQL<br/>Neon Cloud)]
        F[Gmail SMTP<br/>fastapi-mail]
        G[Cloudflare Turnstile<br/>CAPTCHA]
        H[Google Gemini API<br/>AI Summaries]
    end

    A -- "HTTPS / JWT Bearer token" --> B
    B --> C
    C --> D
    D -- "SQL" --> E
    C -- "send email" --> F
    B -- "verify token" --> G
    C -- "generate summary" --> H
```

**Request flow:** Frontend (Axios, JWT attached) → FastAPI router (auth + role check) →
Pydantic validation → Service layer (business rules) → SQLAlchemy ORM → PostgreSQL.
The response travels back through the same layers in reverse.

---

## Database Schema (ER Diagram)

```mermaid
erDiagram
    USERS ||--o| RESEARCHERS : "has profile"
    USERS ||--o{ OTP_CODES : "receives"
    USERS ||--o{ NOTIFICATIONS : "receives"
    INSTITUTIONS ||--o{ USERS : "employs"
    INSTITUTIONS ||--o{ DEPARTMENTS : "has"
    INSTITUTIONS ||--o{ RESEARCHERS : "affiliates"
    DEPARTMENTS ||--o{ RESEARCHERS : "belongs to"
    RESEARCHERS ||--o{ PUBLICATIONS : "owns"
    RESEARCHERS }o--o{ PUBLICATIONS : "co-authors"
    RESEARCHERS ||--o{ CITATIONS : "via publication"
    RESEARCHERS ||--o{ CONFERENCE_REGISTRATIONS : "registers"
    RESEARCHERS ||--o{ COLLABORATIONS : "requests/receives"
    RESEARCHERS ||--o{ MESSAGES : "sends"
    CONFERENCES ||--o{ CONFERENCE_REGISTRATIONS : "has"
    CONFERENCES ||--o{ PUBLICATIONS : "linked to (optional)"
    PUBLICATIONS ||--o{ CITATIONS : "has"
    PUBLICATIONS ||--o{ COLLABORATIONS : "optionally linked"
    COLLABORATIONS ||--o{ MESSAGES : "has thread"
    USERS ||--o{ PUBLICATIONS : "reviews"

    USERS {
        int id PK
        string username
        string email
        string password_hash
        string role
        string status
        int institution_id FK
        bool must_reset_password
    }
    INSTITUTIONS {
        int id PK
        string institution_name
        string email
        string city
        string country
    }
    DEPARTMENTS {
        int id PK
        int institution_id FK
        string department_name
    }
    RESEARCHERS {
        int id PK
        int user_id FK
        int institution_id FK
        int department_id FK
        string first_name
        string last_name
        string designation
    }
    PUBLICATIONS {
        int id PK
        int owner_researcher_id FK
        int conference_id FK
        int reviewer_id FK
        string title
        string publication_type
        string status
        string file_path
    }
    CITATIONS {
        int id PK
        int publication_id FK
        string cited_title
        int cited_year
    }
    CONFERENCES {
        int id PK
        string title
        string mode
        datetime start_date
        datetime end_date
    }
    CONFERENCE_REGISTRATIONS {
        int id PK
        int conference_id FK
        int researcher_id FK
        string role
    }
    COLLABORATIONS {
        int id PK
        int requester_id FK
        int recipient_id FK
        int publication_id FK
        string status
    }
    MESSAGES {
        int id PK
        int collaboration_id FK
        int sender_researcher_id FK
        string content
    }
    OTP_CODES {
        int id PK
        int user_id FK
        string code
        bool is_used
    }
    NOTIFICATIONS {
        int id PK
        int user_id FK
        string title
        bool is_read
    }
```

Every relationship shown above is a real foreign key enforced by PostgreSQL — not just
checked in application code.

---

## Roles & Access Model

| Role | Created by | Approval needed | Key permissions |
|---|---|---|---|
| **System Admin** | Seeded once via CLI script | No | Manages institutions, creates Institution Admins, platform-wide analytics |
| **Institution Admin** | System Admin | No — forced password reset | Approves researchers, manages departments/reviewers, institution-scoped reports |
| **Researcher** | Public self-registration | **Yes** — by Institution Admin | Publications, collaborations, conference registration, citations |
| **Reviewer** | System Admin / Institution Admin | No — forced password reset | Claims and reviews submitted publications |

Registration flow: Researcher registers → `PENDING` status → Institution Admin approves →
`APPROVED` → login unlocked.

---

## Getting Started (Local Setup)

### Prerequisites
- Python 3.13+
- Node.js 20+
- A PostgreSQL database (local, or free tier on [Neon](https://neon.tech))
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) (for email/OTP/CAPTCHA-adjacent features)
- A free [Cloudflare Turnstile](https://dash.cloudflare.com) widget (for CAPTCHA)
- A free [Google Gemini API key](https://aistudio.google.com/apikey) (for AI summaries)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd Scientific-Collaboration-Network-Analyzer-Group-1
```

### 2. Backend setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt --break-system-packages
```

Create `backend/.env` (see [Environment Variables](#environment-variables) below).

```bash
alembic upgrade head
python -m app.db.seed_admin <username> <email> <password>   # creates first System Admin

uvicorn app.main:app --reload
```

Backend runs at `http://127.0.0.1:8000` — API docs at `http://127.0.0.1:8000/docs`.

### 3. Frontend setup
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
VITE_API_URL=http://127.0.0.1:8000
VITE_TURNSTILE_SITE_KEY=<your Turnstile site key>
```

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`.

### 4. First login
1. Log in as the System Admin you seeded
2. Create an Institution (System Admin dashboard)
3. Create a Department for that institution
4. Create an Institution Admin (System Admin dashboard) — check the email inbox for temporary credentials
5. Register a Researcher account publicly at `/register`
6. Log in as the Institution Admin, approve the pending researcher
7. Log in as the Researcher — you now have full access to publications, conferences, and collaborations

---

## Running with Docker

The entire application (backend + frontend) can be run in containers via Docker Compose.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Steps

1. Create a `.env` file at the **project root** (same folder as `docker-compose.yml`) with
   all the variables listed in [Environment Variables](#environment-variables).

2. From the project root:
```bash
docker-compose up --build
```

3. Access:
   - Frontend: `http://localhost:5173`
   - Backend API docs: `http://localhost:8000/docs`

4. To stop:
```bash
docker-compose down
```

Uploaded publication files persist across container restarts via a named Docker volume
(`uploads_data`).

### Docker Architecture

```mermaid
flowchart TB
    subgraph Docker Compose
        F[frontend container<br/>Nginx + built React app<br/>:5173 to :80]
        B[backend container<br/>Uvicorn + FastAPI<br/>:8000]
        V[(Named volume<br/>uploads_data)]
    end
    N[Neon PostgreSQL<br/>Cloud, external]

    F -- "API calls" --> B
    B -- "reads/writes" --> V
    B -- "SQL over internet" --> N
```

---

## Environment Variables

Create a `.env` file (backend, and root for Docker) with:

```dotenv
# Database
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Auth
SECRET_KEY=<generate with: python -c "import secrets; print(secrets.token_urlsafe(64))">
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480

# CAPTCHA (Cloudflare Turnstile)
TURNSTILE_SECRET=<your Turnstile secret key>

# Email (Gmail SMTP example)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=<Gmail App Password>
MAIL_FROM=your-email@gmail.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_STARTTLS=True
MAIL_SSL_TLS=False

# AI Summaries
GEMINI_API_KEY=<your Gemini API key>
```

> **Security note:** never commit `.env` to git. All values above are real credentials —
> treat them the same way you would a password.

---

## API Documentation

Full interactive API documentation is auto-generated by FastAPI and available at:

```
http://127.0.0.1:8000/docs        (local)
http://localhost:8000/docs        (Docker)
```

This provides a live Swagger UI where every endpoint can be tested directly, including
request/response schemas, required auth, and example payloads.

### Endpoint groups

| Group | Base path | Notes |
|---|---|---|
| Authentication | `/auth` | Login (MFA-gated), OTP verification, password reset |
| Users | `/users` | Registration, approval, role-based creation |
| Institutions | `/institutions` | CRUD |
| Departments | `/departments` | CRUD, institution-scoped |
| Researchers | `/researchers` | Profile management, search |
| Publications | `/publications` | Full lifecycle, file upload/download, browse |
| Citations | `/publications/{id}/citations` | Add/view/edit/delete |
| Conferences | `/conferences` | CRUD, registration, participants |
| Collaborations | `/collaborations` | Send/accept/reject, chat messages |
| Reports | `/reports` | Researcher/publication/conference reports, exports |
| Analytics | `/analytics` | Platform-wide summary stats |
| Notifications | `/notifications` | List, mark read, delete |

---

## Project Structure

```
backend/
  app/
    api/            # FastAPI routers
    core/           # config, security, role-guard dependencies
    db/             # database session, admin seed script
    models/         # SQLAlchemy models
    schemas/        # Pydantic schemas
    services/       # business logic
    utils/          # shared constants/enums
  alembic/          # database migrations
  Dockerfile
  requirements.txt

frontend/
  src/
    components/     # dashboard, publication, conference, collaboration UI pieces
    pages/          # route-level pages, including role dashboards
    services/       # Axios API calls per resource
    styles/         # design tokens + page-specific CSS
    routes/         # route definitions, protected route logic
    context/        # auth context
  Dockerfile
  nginx.conf

docker-compose.yml
```

---

## AI Contributions

This project was built with substantial assistance from Claude (Anthropic), used for:

- Architectural guidance on backend layering (routes → services → models) and role-based
  access control design
- Debugging real issues encountered during development, including Alembic migration
  history conflicts, FastAPI route-ordering bugs, and async/event-loop errors
- Code generation for backend endpoints, services, and database models
- Frontend component design and styling, including the design token system
- Writing this documentation, including the architecture and ER diagrams

The **AI-powered publication summary feature itself** (using Google's Gemini API) is a
distinct, separate feature of the application — built by a team member — allowing
researchers to generate an AI-written summary of their publication's abstract.

---

## Screenshots

> _Add screenshots here before submission — recommended: landing page, each role's
> dashboard, publication creation flow, review queue, analytics dashboard, and the
> chat interface._

| Landing Page | Researcher Dashboard |
|---|---|
| _screenshot_ | _screenshot_ |

| Reviewer Dashboard | Analytics Dashboard |
|---|---|
| _screenshot_ | _screenshot_ |

---

## Known Limitations

- MFA requires a valid, deliverable email address on the account — test accounts created
  with placeholder emails cannot complete login
- File uploads are stored on local/container disk, not cloud object storage — files
  uploaded to one backend instance are not visible to another running instance unless
  both point at the same deployed backend
- Chat uses polling (checks every few seconds) rather than WebSockets — adequate at
  current scale, not truly real-time
- No automated test suite yet
- HTTPS is not yet configured — currently runs over HTTP in local/Docker environments

---

## Future Scope

- HTTPS deployment on a cloud platform (Render/Railway) with a custom domain
- Migrate publication file storage to cloud object storage (e.g. S3-compatible) so
  uploads are accessible regardless of which backend instance handles the request
- Automated backend test suite (pytest) and CI pipeline
- WebSocket-based real-time chat instead of polling
- Push notifications (browser) in addition to in-app and email
- Rate limiting on authentication endpoints
- Audit log module for tracking administrative actions in detail
