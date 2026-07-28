# Scientific Collaboration Network Analyzer

A full-stack web application for managing and analyzing scientific research collaboration across institutions — tracking researchers, departments, publications, co-authorship, and conference participation, with role-based dashboards for System Admins, Institution Admins, Researchers, and Reviewers.

## Features

- **Role-based access control** — System Admin, Institution Admin, Researcher, and Reviewer roles, each with their own dashboard and permissions
- **User approval workflow** — new accounts go through an approval/status flow (e.g. pending, approved) before gaining full access
- **Institution & department management** — create and manage institutions and their departments
- **Researcher profiles** — researchers linked to institutions and departments
- **Publications with reviewer workflow** — submit publications, assign co-authors, and route them through a reviewer approval process
- **Conference registrations** — researchers can register for conferences
- **JWT-based authentication** — secure token-based login with password reset support

## Tech Stack

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) (Python)
- SQLAlchemy ORM + Alembic (database migrations)
- PostgreSQL (tested with [Neon](https://neon.tech) serverless Postgres)
- JWT authentication (`python-jose` / `passlib`)

**Frontend**
- React + Vite
- React Router
- Axios (API client)

## Project Structure

```
.
├── backend/          # FastAPI application
│   ├── app/
│   │   ├── api/          # Route handlers (auth, users, institutions, departments, researchers, publications, conferences)
│   │   ├── core/         # Config, security, dependencies
│   │   ├── db/           # Database session, seeding scripts
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   └── services/     # Business logic layer
│   ├── alembic/          # Database migrations
│   └── requirements.txt
└── frontend/          # React + Vite application
    └── src/
        ├── components/   # Reusable UI components (per module)
        ├── pages/         # Route-level pages, including role-specific dashboards
        ├── services/      # API service wrappers
        ├── context/       # Auth context
        └── routes/        # App routing + protected routes
```

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- A PostgreSQL database (e.g. a free [Neon](https://neon.tech) project)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
```

Create `backend/.env` (see `.env.example` for the template):

```
DATABASE_URL=postgresql://<user>:<password>@<host>/<dbname>?sslmode=require
SECRET_KEY=<a long random string>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
```

Run migrations and seed an admin account:

```bash
alembic upgrade head
python -m app.db.seed_admin <username> <email> <password>
```

Start the API:

```bash
uvicorn app.main:app --reload
```

- API root: `http://127.0.0.1:8000/`
- Interactive API docs (Swagger UI): `http://127.0.0.1:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173`

> The frontend's API base URL is set to `http://127.0.0.1:8000` in `src/services/api.js`. Update this if your backend runs elsewhere.

## API Overview

The backend exposes REST endpoints grouped by resource, all documented interactively at `/docs`:

| Router | Responsibility |
|---|---|
| `auth` | Login, token issuance, password reset |
| `user` | User management, approval workflow |
| `institution` | Institution CRUD |
| `department` | Department CRUD (linked to institutions) |
| `researcher` | Researcher profiles (linked to users, institutions, departments) |
| `publication` | Publication submission, co-authorship, reviewer approval workflow |
| `conference` | Conferences and researcher registrations |

Authentication is via JWT bearer tokens — log in through `auth`'s login endpoint, then include the returned token as `Authorization: Bearer <token>` on subsequent requests. The frontend handles this automatically once logged in.

## License

See [LICENSE](./LICENSE).
