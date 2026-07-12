# Scientific Collaboration Network Analyzer

A platform for researchers, institutions, and reviewers to manage research profiles,
publications, and peer review — built with FastAPI (backend) and React + Vite (frontend).

## Status: Milestone 1 core complete, Milestone 2 (Publications) in progress

---

## Tech Stack

**Backend**
- FastAPI + SQLAlchemy + Alembic (migrations)
- PostgreSQL (hosted on [Neon](https://neon.tech))
- JWT authentication (`python-jose`), password hashing (`passlib` / bcrypt)
- Pydantic v2 schemas

**Frontend**
- React 19 + Vite
- React Router v7
- Axios
- Bootstrap (legacy CRUD pages) + custom design system (dashboards, landing, auth)
- react-toastify for notifications

---

## Roles & Access Model

| Role | Created by | Approval needed | Notes |
|---|---|---|---|
| **System Admin** | Seeded once via CLI script (`app/db/seed_admin.py`) | No | Onboards institutions and institution admins |
| **Institution Admin** | System Admin (via dashboard form) | No — forced password reset on first login | Approves researchers, manages departments/reviewers for their institution |
| **Researcher** | Public self-registration | **Yes** — approved by their Institution Admin | Can add/submit publications |
| **Reviewer** | System Admin or Institution Admin | No — forced password reset on first login | Reviews submitted publications (approve/reject with comments) |

**Registration flow:** Researcher registers → account status `PENDING` → Institution Admin
approves/rejects from their dashboard → only `APPROVED` researchers can log in.

---

## Features Implemented So Far

### Authentication & Users
- [x] JWT login, role-based route guards (frontend + backend)
- [x] Public researcher registration (with institution + department selection)
- [x] Institution Admin creation (System Admin only)
- [x] Reviewer creation (System Admin / Institution Admin)
- [x] Researcher approval/rejection queue (Institution Admin dashboard)
- [x] Forced password reset on first login for admin-created accounts
- [x] Role-based dashboard redirect after login

### Core Data Management
- [x] Institutions — full CRUD (System Admin)
- [x] Departments — full CRUD, scoped to own institution for Institution Admin
- [x] Researcher profiles — admin can view/manage department & designation;
      bio/skills/interests are researcher-owned (read-only for admins)

### Publications (Milestone 2, in progress)
- [x] Researcher: create publication (draft), edit while draft/rejected, submit for review, delete
- [x] Reviewer: view review queue, claim a submission, approve/reject with comments
- [x] Publication status lifecycle: `DRAFT → SUBMITTED → UNDER_REVIEW → PUBLISHED / REJECTED`
- [ ] File upload for publication documents (schema has `file_path`, upload not wired yet)
- [ ] Co-author linking to other platform researchers (schema supports it, UI not built yet)

### Frontend Design System
- [x] Landing page with animated node-network hero, role explainer sections
- [x] Unified dark-sidebar dashboard shell (`DashboardShell` + `Sidebar`) used across
      all role dashboards and legacy management pages (`DashboardLayout`)
- [x] Design tokens in `src/styles/variables.css` (colors, type scale, spacing)

### Not Yet Started
- [ ] Projects module (create project, invite collaborators across institutions)
- [ ] Conferences module
- [ ] Cross-institution collaboration linking
- [ ] Notifications
- [ ] Reports / analytics dashboards
- [ ] Email delivery for credentials (currently shown once on-screen to the creating admin)

---

## Project Structure

```
backend/
  app/
    api/            # FastAPI routers (auth, user, institution, department, researcher, publication)
    core/           # config, security (JWT/hashing), dependencies (role guards)
    db/             # database session, seed_admin.py
    models/         # SQLAlchemy models
    schemas/        # Pydantic schemas
    services/       # business logic
    utils/          # constants (UserRole, UserStatus, PublicationStatus)
  alembic/          # migrations
  .env              # DATABASE_URL, SECRET_KEY, etc. (not committed)

frontend/
  src/
    components/     # dashboard/, publication/, researcher/, department/, institution/
    pages/
      dashboards/   # role-specific dashboards (SystemAdmin, InstitutionAdmin, Researcher, Reviewer)
    services/       # axios API calls per resource
    styles/         # design tokens + page-specific CSS
    routes/         # AppRoutes, ProtectedRoute (role-based)
    context/        # AuthContext
```

---

## Local Setup

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt --break-system-packages

# .env
DATABASE_URL=postgresql://<neon-connection-string>
SECRET_KEY=<generate with: python -c "import secrets; print(secrets.token_urlsafe(64))">
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480

alembic upgrade head
python -m app.db.seed_admin <username> <email> <password>   # first System Admin

uvicorn app.main:app --reload
```

API docs: `http://127.0.0.1:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173`

---

## Known Gaps / Things to Revisit

- Publication file upload not yet implemented (local storage was the plan — see schema's `file_path`)
- No email service — admin-created account credentials are shown once on-screen and shared manually
- Co-author selection currently free-text only (`authors_text`); linking to real researcher
  records (`coauthor_researcher_ids`) is supported by the API but has no UI yet
