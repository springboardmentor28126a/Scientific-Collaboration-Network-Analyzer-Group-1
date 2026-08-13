# Scientific Collaboration Network Analyzer

The Scientific Collaboration Network Analyzer (SCNA) is a research-collaboration management platform. It provides authenticated users with researcher discovery, profiles, publication and citation management, institution search, collaboration requests, research groups, messaging, conferences, verification, moderation, and network analytics.

This README is based on the current source tree, SQLAlchemy models, route declarations, frontend routes, configuration templates, tests, Git metadata, and existing project notes. Features are labelled as implemented, partially implemented, or planned where the repository supports that distinction.

## Contents

- [Project overview](#project-overview)
- [Features](#features)
- [Technology stack](#technology-stack)
- [Project architecture](#project-architecture)
- [Database and ER diagram](#database-and-er-diagram)
- [User roles and permissions](#user-roles-and-permissions)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Running the project](#running-the-project)
- [Testing and quality checks](#testing-and-quality-checks)
- [Docker Setup](#docker-setup)
- [Problems faced and solutions](#problems-faced-and-solutions)
- [Important implementation notes](#important-implementation-notes)
- [Future improvements](#future-improvements)

## Project overview

SCNA provides one place for academic collaboration workflows:

1. A user registers and creates a researcher, student, faculty, reviewer, or administrator profile.
2. A user can discover researchers, institutions, publications, and collaboration connections.
3. Researchers can create publications, upload PDFs, submit work for review, and manage citations.
4. Members can create research groups with shared files, meetings, group chat, and member management.
5. Users can send friend requests and exchange direct messages.
6. Conferences can be created, searched, detailed, and registered for.
7. Faculty and administrators can verify users, moderate accounts, and review platform activity.
8. Dashboards and network analytics summarize publications, citations, activity, and collaboration relationships.

## Features

### Feature status

| Feature | Status | Evidence/current scope |
|---|---|---|
| Registration and login | Implemented | `/auth/register`, `/auth/login`, JWT creation, React login/register pages |
| Password recovery endpoint | Partially implemented | `/auth/forgot-password` exists; the repository does not verify an email-delivery/reset-token workflow |
| Researcher profiles | Implemented | Researcher CRUD router, `Profile.jsx`, profile schemas, institution fields |
| Institution search and management | Implemented | Institution router, `InstitutionSearch`, institution pages and admin flows |
| Researcher discovery | Implemented | Researcher listing/search, global search, researcher pages |
| Collaboration requests | Implemented | `friend_requests`, `/friends/*`, notifications, and Collaborations page |
| Accepted collaboration list | Implemented | Accepted friend requests are returned by `/friends/list/{user_id}`; there is no separate `collaborations` table |
| Notifications and activity | Implemented | Notification/activity models and dashboard routes |
| Research groups/workspaces | Implemented | Groups, memberships, invitations, group pages, files, meetings, and group chat |
| Private chat | Implemented | `direct_conversations`, `direct_messages`, `/private-chat/*`, and Chat page |
| Group chat | Implemented | `chat_messages`, `/chat/*`, and group chat pages |
| Publications and PDF upload | Implemented | Publication CRUD, `/publications/upload`, local paper directory |
| Citation management | Implemented | Citation CRUD, bulk creation, statistics, and formatting routes |
| Publication review | Implemented | Reviewer routes, reviewer assignment/review fields, approve/reject workflow |
| Conferences | Implemented | Conference CRUD/search/details and registration routes |
| Conference meeting details | Implemented | `conference_meeting_details` model and conference create/update response mapping |
| Group meeting scheduler | Implemented | Meetings CRUD and reminder scheduler |
| Shared group files | Implemented | Group file metadata plus Supabase Storage upload/delete/signed URL helpers |
| Verification workflow | Implemented | Verification document upload/status/pending/approve/reject routes and pages |
| Role-based administration | Implemented | Faculty, reviewer, institution-admin, and system-admin routes/pages |
| Dashboard analytics/network graph | Implemented | `/analytics/overview`, `/analytics/network`, dashboard pages |
| AI Research Assistant and recommendations | Partially implemented | `/ai/status`, `/ai/chat`, `/ai/recommendations`, and `/research-ai`; requires an AI provider for generated responses |

The historical names “collaborations” and “workspace” are represented by friend-request collaboration records and research-group/private workspace pages. A legacy frontend `Workspace.jsx` also references `/collaboration/workspace/{id}`, but no matching backend router was verified; that legacy path should not be treated as a complete active workflow.

### Authentication and profiles

- Registration, login, password recovery, and JWT-based authentication.
- Protected API requests using a bearer token.
- Profiles containing institution, department, designation, research interests, skills, biography, ORCID, Google Scholar, LinkedIn, and contact information.
- Profile CRUD operations for researcher records.
- Account status enforcement for active, blocked, or suspended accounts.

### Publications and citations

- Create, read, update, delete, search, and filter publications.
- Store publication title, authors, abstract, journal, type, year, DOI, keywords, status, and PDF path.
- Publication ownership checks prevent users from modifying another researcher's publication.
- Reviewer assignment and approve/reject workflow with review comments and timestamps.
- Citation creation, bulk citation creation, citation listing, statistics, and formatted citation output.

### Research groups and collaboration

- Create, edit, delete, search, and browse research groups.
- Add and remove group members with group roles.
- Send, accept, reject, and track group invitations.
- Schedule group meetings with date, time, link, and status.
- Group chat and private one-to-one conversations.
- Upload, list, download through signed URLs, and delete group files.

### Conferences and institutions

- Create and manage conferences, including dates, location, website, organizer, and description.
- Store physical or online conference meeting details.
- Register users for conferences and check registration status.
- Search and manage institutions using institution metadata and AISHE codes.
- Link users and publications to institutions.

### Verification, administration, and analytics

- Upload verification documents and track approval status.
- Faculty verification workflow for researcher/student records.
- System administrator dashboard, user moderation, warnings, status changes, role changes, institution and publication administration, and moderation history.
- Notifications and activity events, including meeting and conference reminders.
- Overview and network analytics endpoints for collaboration insights.

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router, Axios, React Icons |
| Frontend tooling | Vite, ESLint |
| Backend | Python, FastAPI, Uvicorn |
| Validation | Pydantic |
| ORM/database access | SQLAlchemy |
| Development database fallback | SQLite only for local fallback |
| Production database | Supabase PostgreSQL through `SCNA_DATABASE_URL` |
| Authentication | JWT with `python-jose`, bcrypt/password hashing |
| File storage | Supabase Storage for group files; local `uploads/papers` for paper files |
| API communication | REST/JSON with CORS configured for local Vite ports |

## Project architecture

```text
Scientific-Collaboration-Network-Analyzer-group-1/
├── backend/
│   ├── main.py                 # FastAPI application, middleware, routers, startup jobs
│   ├── database/
│   │   ├── database.py         # Engine, session factory, declarative Base
│   │   └── models.py           # Core SQLAlchemy models
│   ├── models/                 # Group, meeting, chat, invitation, file, and verification models
│   ├── schemas/                # Pydantic request/response contracts
│   ├── routers/                # REST API endpoints grouped by feature
│   ├── services/               # Business and storage services
│   ├── utils/                  # Security, permissions, dependencies, passwords, Supabase helpers
│   ├── data/                   # Seed data such as institutions.json
│   └── tests/                  # Backend contract/security tests
├── client/
│   └── src/
│       ├── components/         # Reusable UI and feature components
│       ├── pages/              # Route-level screens
│       ├── layouts/            # Shared application layouts
│       ├── services/           # Axios API and feature service modules
│       ├── hooks/              # Reusable React hooks
│       └── utils/              # Auth storage and frontend permissions
├── static/                     # Legacy/static CSS and JavaScript assets
├── templates/                  # Legacy/server-rendered HTML templates
├── uploads/                    # Local paper upload directory
├── main.py                     # Root ASGI entry point: imports backend.main:app
├── scientific_collaboration.db # Bundled local SQLite database
├── requirements.txt            # Python dependencies
├── package.json                # Root scripts delegating to client
└── TODO.md                     # Implementation progress notes
```

### Request flow

```text
React page/component
        │
        ▼
client/src/services/api.js (Axios + JWT interceptor)
        │ HTTP/JSON
        ▼
FastAPI router in backend/routers/
        │
        ├── authentication and role/ownership checks
        ├── Pydantic schema validation
        ├── service/helper logic
        ▼
SQLAlchemy session → SQLite/PostgreSQL
        │
        └── Supabase Storage for group-file objects
```

The backend exposes interactive API documentation at `/docs` when the server is running.

## Database and ER diagram

The application uses SQLAlchemy models. New tables are created at startup with `Base.metadata.create_all`; compatibility migrations add selected columns/tables for existing SQLite and PostgreSQL deployments.

The following Mermaid ER diagram shows the main entities and relationships. It intentionally groups the schema into the major business areas while retaining the important foreign keys.

```mermaid
erDiagram
    INSTITUTIONS ||--o{ USERS : employs
    INSTITUTIONS ||--o{ PUBLICATIONS : associated_with
    USERS ||--o{ PUBLICATIONS : owns
    USERS ||--o{ PUBLICATIONS : selected_reviewer
    USERS ||--o{ PUBLICATIONS : reviews
    CONFERENCES ||--o{ PUBLICATIONS : hosts
    PUBLICATIONS ||--o{ CITATIONS : cites
    PUBLICATIONS ||--o{ CITATIONS : cited_by

    USERS ||--o{ RESEARCH_GROUPS : creates
    RESEARCH_GROUPS ||--o{ RESEARCH_GROUP_MEMBERS : contains
    USERS ||--o{ RESEARCH_GROUP_MEMBERS : joins
    RESEARCH_GROUPS ||--o{ GROUP_INVITATIONS : receives
    USERS ||--o{ GROUP_INVITATIONS : sends_or_receives
    RESEARCH_GROUPS ||--o{ GROUP_FILES : stores
    USERS ||--o{ GROUP_FILES : uploads
    RESEARCH_GROUPS ||--o{ MEETINGS : schedules
    USERS ||--o{ MEETINGS : creates
    RESEARCH_GROUPS ||--o{ CHAT_MESSAGES : contains
    USERS ||--o{ CHAT_MESSAGES : sends

    USERS ||--o{ DIRECT_CONVERSATIONS : participates
    DIRECT_CONVERSATIONS ||--o{ DIRECT_MESSAGES : contains
    USERS ||--o{ DIRECT_MESSAGES : sends
    USERS ||--o{ FRIEND_REQUESTS : sends_or_receives
    USERS ||--o{ VERIFICATION_DOCUMENTS : submits
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ ACTIVITY_EVENTS : generates
    USERS ||--o{ MODERATION_EVENTS : is_target_or_moderator

    USERS {
        int id PK
        string name
        string email UK
        string role
        int institution_id FK
        string verification_status
        string account_status
    }
    INSTITUTIONS { int id PK; string aishe_code UK; string name; string state; string country }
    PUBLICATIONS { int id PK; int researcher_id FK; int institution_id FK; int conference_id FK; string title; string status; int selected_reviewer_id FK; int reviewed_by FK }
    CITATIONS { int id PK; int citing_publication_id FK; int cited_publication_id FK }
    CONFERENCES { int id PK; int created_by FK; string name; date start_date; date end_date }
    RESEARCH_GROUPS { int id PK; int created_by FK; string name; string visibility }
    RESEARCH_GROUP_MEMBERS { int id PK; int group_id FK; int user_id FK; string role }
    GROUP_INVITATIONS { int id PK; int group_id FK; int sender_id FK; int receiver_id FK; string status }
    GROUP_FILES { int id PK; int group_id FK; int uploaded_by FK; string storage_path UK }
    MEETINGS { int id PK; int group_id FK; int created_by FK; date meeting_date; string status }
    CHAT_MESSAGES { int id PK; int group_id FK; int sender_id FK; string message }
    DIRECT_CONVERSATIONS { int id PK; int user1_id FK; int user2_id FK }
    DIRECT_MESSAGES { int id PK; int conversation_id FK; int sender_id FK; boolean is_read }
    FRIEND_REQUESTS { int id PK; int sender_id FK; int receiver_id FK; string status }
    VERIFICATION_DOCUMENTS { int id PK; int user_id FK; int verified_by FK; string status }
    NOTIFICATIONS { int id PK; int user_id FK; string notification_type; boolean is_read }
    ACTIVITY_EVENTS { int id PK; int user_id FK; string event_type }
    MODERATION_EVENTS { int id PK; int target_user_id; int moderator_id FK; string action }
```

## User roles and permissions

Permissions are defined in `backend/utils/permissions.py` and enforced by backend dependencies and route logic.

| Role | Main responsibilities |
|---|---|
| Researcher | Own publications, create groups/conferences, manage meetings, chat, and view analytics |
| Student | View publications, join groups, view meetings, chat, and view analytics |
| Faculty | Manage researcher/student records and approve verification requests |
| Reviewer | Review, approve, or reject assigned publications |
| Institution Admin | Manage institution information and view institution-related users/publications |
| System Admin | Platform-wide administration through wildcard permissions |

The backend remains the source of truth: the frontend permission utility is for user experience, while protected API routes enforce authorization. A partial unique index also enforces the single-System-Admin invariant.

## Getting started

### Prerequisites

- Python 3.10 or newer
- Node.js and npm
- Git
- PostgreSQL/Supabase only if using a non-local database or remote storage

### 1. Clone and enter the project

```bash
git clone <repository-url>
cd Scientific-Collaboration-Network-Analyzer-group-1
```

### 2. Create and activate a Python virtual environment

Windows PowerShell:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Linux/macOS:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Install frontend dependencies

```bash
npm install
```

The root `postinstall` script installs dependencies in `client/`.

## Configuration

Create `backend/.env` for local backend configuration. Do not commit secrets.

```env
# Optional in local development; SQLite is used when this is absent.
SCNA_DATABASE_URL=sqlite:///./scientific_collaboration.db

# Use a long random value outside local development.
SCNA_SECRET_KEY=replace-with-a-long-random-secret

# Required for Supabase group-file storage.
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key

# Set production to require explicit database and secret configuration.
SCNA_ENV=development
```

For PostgreSQL, replace the database URL, for example:

```env
SCNA_DATABASE_URL=postgresql+psycopg2://user:password@host:5432/database
```

The frontend defaults to `http://127.0.0.1:8000`. To use another API URL, create `client/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

## Running the project

Start the backend from the repository root:

```bash
uvicorn main:app --reload
```

Start the frontend in a second terminal:

```bash
cd client
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`. API documentation is available at `http://127.0.0.1:8000/docs`.

Useful root commands:

```bash
npm run dev       # Start the client development server
npm run build     # Create a production client build
npm run lint      # Run frontend ESLint
```

## Testing and quality checks

Run the backend security/contract tests:

```bash
python -m unittest discover -s backend/tests -p "test_*.py"
```

Run frontend checks:

```bash
npm run lint
npm run build
```

The existing backend tests cover wildcard system-admin permissions, reviewer restrictions, publication ownership checks, moderation routes, and reminder/registration contracts.

## Problems faced and solutions

### 1. Evolving the `users` table without breaking existing databases

**Problem:** Profile requirements grew to include AISHE code, state, district, pincode, institution type, country, verification status, and moderation fields. `create_all()` does not alter an existing table.

**Solution:** Updated the profile/researcher schemas and CRUD responses, then added startup migrations that detect missing SQLite columns and PostgreSQL columns. The work is recorded in `TODO.md` as completed and profile CRUD was tested.

### 2. Supporting both local development and PostgreSQL deployment

**Problem:** Developers need a database that works immediately, while deployment needs PostgreSQL/Supabase and must not silently use SQLite.

**Solution:** `backend/database/database.py` selects `SCNA_DATABASE_URL` or `DATABASE_URL`, defaults to SQLite only in development, and raises an error in production when the database is not configured. PostgreSQL-specific migrations are kept separate.

### 3. Preventing unauthorized publication changes

**Problem:** Any authenticated user should not be able to edit or delete another researcher's publication.

**Solution:** Added an explicit publication-owner guard in the publication router and contract tests for both the permitted owner and rejected non-owner. Role permissions also prevent reviewers from creating publications.

### 4. Managing several roles with different workflows

**Problem:** Researchers, students, faculty, reviewers, institution administrators, and system administrators need different capabilities.

**Solution:** Centralized role permissions in `ROLE_PERMISSIONS`, added route-level dependencies/guards, and used frontend permission helpers for navigation and visibility. Backend authorization remains authoritative.

### 5. Keeping a single System Admin account

**Problem:** Application-only checks could be bypassed by concurrent requests or direct database changes.

**Solution:** Added a partial unique index on `users.role` where the role is `System Admin`, backed by API validation as well.

### 6. Combining local uploads with remote shared storage

**Problem:** Paper PDFs and group collaboration files have different access and sharing needs.

**Solution:** Paper uploads use the local `uploads/papers` directory, while group files use Supabase Storage with unique paths and expiring signed URLs. Database records retain the file metadata and storage path.

### 7. Keeping the frontend and backend API contract aligned

**Problem:** Changes to profile fields and feature modules can cause mismatches between React forms and FastAPI response models.

**Solution:** Added Pydantic schemas for request/response contracts, updated profile CRUD responses, centralized Axios configuration, and used feature-specific service modules such as `groupService`, `groupFileService`, and `citationService`.

### 8. Delivering reminders without a separate worker

**Problem:** Meeting and conference reminders need to be generated periodically.

**Solution:** The FastAPI startup event launches an asynchronous scheduler that checks due reminders every 60 seconds and writes notifications. Shutdown cancels the task.

### 9. Safely handling blocked and suspended accounts

**Problem:** Relying on frontend state would allow a blocked account to continue calling the API directly.

**Solution:** JWT authentication resolves the user on every protected request and rejects non-active accounts at the backend, with an exception for the System Admin role.

## Important implementation notes

- Never commit `backend/.env`, production secrets, or real user documents.
- Change `SCNA_SECRET_KEY` before any deployment; the development fallback is intentionally not suitable for production.
- Supabase Storage must contain the configured `group-files` bucket before group-file operations are used.
- `Base.metadata.create_all()` is convenient for development, but a dedicated migration tool such as Alembic is recommended for production schema changes.
- The bundled SQLite database is useful for local development. Treat it as application data and back it up before changing schema or deleting records.
- CORS currently allows several local Vite ports. Production deployments should replace this with the exact frontend origin.
- The repository contains both `client/` and `frontend/`; the root scripts and active application imports use `client/`.

## Future improvements

- Add Alembic migrations and remove reliance on startup schema mutation.
- Add broader automated API integration tests and frontend component tests.
- Add database constraints for all status/role values and unique membership/request combinations.
- Add pagination and indexes for high-volume publication, message, notification, and analytics queries.
- Move paper files to managed object storage with signed URLs and virus scanning.
- Add production logging, monitoring, rate limiting, refresh tokens, and secure cookie-based authentication where appropriate.
- Add CI to run linting, tests, and builds on every pull request.
- Clarify and consolidate the duplicate `client/` and `frontend/` frontend directories.

## Problem statement and objectives

Researchers often need to search across disconnected profiles, institutions, publications, and communication channels before they can identify and manage a collaboration. SCNA addresses this by bringing researcher information, publication records, collaboration requests, group workspaces, communication, meetings, conferences, and analytics behind one authenticated application.

The repository supports these objectives:

- maintain searchable researcher and institution information;
- let users send and manage collaboration requests;
- provide a list of accepted collaborators;
- manage publications, citations, reviewers, and paper files;
- provide group and private communication workflows;
- organize meetings and conferences;
- support document verification and role-based administration; and
- summarize publication and collaboration activity through dashboards.

The AI assistant and database-backed researcher matching are implemented. Generated explanations require configured AI credentials; database recommendations remain available from authorized SCNA records.

## System architecture

```mermaid
flowchart TD
    U[User] --> F[React + Vite client]
    F --> A[Axios API client\nJWT request interceptor]
    A --> R[FastAPI REST routers]
    R --> V[Pydantic schemas and\nFastAPI dependencies]
    V --> S[SQLAlchemy models/services]
    S --> D[(Supabase PostgreSQL in production\nSQLite only as local fallback)]
    S --> X[Supabase Storage\ngroup-files bucket]
    R --> N[60-second reminder scheduler]
    N --> D
    R --> E[Configurable SMTP email service]
    R --> C[Development CAPTCHA or production provider]
    R --> I[Configurable AI provider]
```

The current root ASGI entry point is `main.py`, which imports `app` from `backend.main`. The backend creates tables at startup and applies limited compatibility migrations. The database backend is selected by `SCNA_DATABASE_URL`/`DATABASE_URL`; it defaults to SQLite only in development. Supabase Storage is used by the group-file service.

## Backend architecture

- `backend/main.py` creates the FastAPI application, mounts `/uploads`, configures CORS, imports models, creates tables, applies compatibility migrations, registers routers, and starts the reminder task.
- `backend/database/database.py` loads environment variables, creates the SQLAlchemy engine/session factory, chooses SQLite/PostgreSQL, and exposes `get_db()`.
- `backend/database/models.py` contains the core user, publication, citation, conference, institution, notification, moderation, activity, and group-chat models.
- `backend/models/` contains research-group, membership, invitation, file, meeting, direct-conversation, direct-message, friend-request, and verification-document models.
- `backend/schemas/` contains Pydantic request and response contracts.
- `backend/routers/` separates the REST API by feature. Routers use database sessions and dependencies for authentication, verification, permissions, and ownership checks.
- `backend/services/` contains publication, researcher, authentication, and storage-related service logic.
- `backend/services/email_service.py` sends configurable security emails; `captcha_service.py` supports development challenges and production provider verification; `mfa_service.py` implements TOTP; and `ai_service.py` calls an OpenAI-compatible provider without sending secrets.
- `backend/utils/` contains JWT security, bcrypt helpers, role permissions, dependency checks, and Supabase helpers.

The normal request path is: route matching → dependency authentication/authorization → Pydantic validation → SQLAlchemy query or service operation → commit/response. FastAPI raises `HTTPException` for invalid credentials, missing records, forbidden actions, and validation/business-rule failures. SQLAlchemy provides parameterized ORM queries rather than manually concatenated SQL for normal data operations.

### CORS

`backend/main.py` explicitly allows local origins on ports 5173 through 5177 for both `localhost` and `127.0.0.1`, with credentials, all methods, and all headers. A deployment-specific origin configuration is not present and should be added before production use. The repository does not contain an incident log proving which historical CORS error was first observed; the current allow-list is verified from source.

## Frontend architecture

The active frontend is `client/`, not the separate starter/template-like `frontend/` directory. `client/src/main.jsx` mounts `App.jsx`; `App.jsx` owns React Router routes and the light/dark theme state.

- `client/src/pages/` contains route-level screens for authentication, profiles, researchers, publications, citations, search, dashboards, analytics, institutions, conferences, collaborations, groups, chat, invitations, settings, notifications, and verification.
- `client/src/components/` contains reusable cards, modals, dashboard views, navigation, file upload, institution search, pagination, protected routing, group workspace components, and publication/conference components.
- `client/src/services/api.js` creates an Axios instance, chooses `VITE_API_URL` or `http://127.0.0.1:8000`, attaches the session token, and clears auth state on a 401 response.
- `client/src/utils/authStorage.js` stores the token and serialized user in `sessionStorage`, deliberately isolating authentication per browser tab.
- `ProtectedRoute.jsx` checks token/user presence, allowed roles, verification state, and System Admin bypass before rendering protected pages.
- Pages use local React state and effects for forms, loading, API responses, alerts, and errors. No external global state library was verified.

## Database architecture

The current model source verifies the following tables. There is no `researcher_profiles`, `collaborations`, or `collaboration_requests` table in the current SQLAlchemy model set; researcher data is stored on `users`, and collaboration requests are stored in `friend_requests`.

| Table | Primary key | Purpose and important relationships |
|---|---|---|
| `users` | `id` | Accounts, roles, profiles, verification and moderation state; `institution_id → institutions.id`; `verified_by → users.id` |
| `institutions` | `id` | Institution directory; related to users and publications |
| `publications` | `id` | Research outputs; `researcher_id → users.id`, `institution_id → institutions.id`, `conference_id → conferences.id`, reviewer IDs → users |
| `citations` | `id` | Directed publication-to-publication citations; both publication IDs → `publications.id` |
| `conferences` | `id` | Conference records; `created_by → users.id` |
| `conference_registrations` | `id` | User registration for conferences; conference/user IDs → parent tables |
| `conference_meeting_details` | `id` | Optional physical/online meeting data; `conference_id → conferences.id` |
| `notifications` | `id` | User notifications; `user_id → users.id` |
| `activity_events` | `id` | User activity history; `user_id → users.id` |
| `moderation_events` | `id` | Moderation audit records; `moderator_id → users.id`; target user is stored as an integer without a declared FK |
| `research_groups` | `id` | Group/workspace metadata; `created_by → users.id` |
| `research_group_members` | `id` | User/group association and group role; group/user IDs → parent tables |
| `group_invitations` | `id` | Group invitations; `group_id → research_groups.id`, sender/receiver IDs → users |
| `group_files` | `id` | Group-file metadata and unique storage path; group/uploader IDs → parent tables |
| `meetings` | `id` | Group meetings; `group_id → research_groups.id`, `created_by → users.id` |
| `chat_messages` | `id` | Group messages; `group_id → research_groups.id`, `sender_id → users.id` |
| `direct_conversations` | `id` | Two-user private conversation; `user1_id` and `user2_id → users.id` |
| `direct_messages` | `id` | Private messages; `conversation_id → direct_conversations.id`, `sender_id → users.id` |
| `friend_requests` | `id` | Collaboration/friend request state; sender and receiver IDs → users |
| `verification_documents` | `id` | Uploaded role-verification evidence; `user_id` and optional `verified_by` → users |

`backend/main.py` imports the additional model modules before `create_all()` so SQLAlchemy knows about their tables. The repository contains a bundled `scientific_collaboration.db`, but the README does not assume that its rows are complete or suitable for production.

### Current ER diagram

```mermaid
erDiagram
    INSTITUTIONS ||--o{ USERS : institution_id
    INSTITUTIONS ||--o{ PUBLICATIONS : institution_id
    USERS ||--o{ PUBLICATIONS : researcher_id
    USERS ||--o{ PUBLICATIONS : selected_reviewer_id
    USERS ||--o{ PUBLICATIONS : reviewed_by
    CONFERENCES ||--o{ PUBLICATIONS : conference_id
    PUBLICATIONS ||--o{ CITATIONS : citing_publication_id
    PUBLICATIONS ||--o{ CITATIONS : cited_publication_id
    USERS ||--o{ CONFERENCES : created_by
    CONFERENCES ||--o{ CONFERENCE_REGISTRATIONS : conference_id
    USERS ||--o{ CONFERENCE_REGISTRATIONS : user_id
    CONFERENCES ||--o| CONFERENCE_MEETING_DETAILS : conference_id
    USERS ||--o{ NOTIFICATIONS : user_id
    USERS ||--o{ ACTIVITY_EVENTS : user_id
    USERS ||--o{ MODERATION_EVENTS : moderator_id
    USERS ||--o{ RESEARCH_GROUPS : created_by
    RESEARCH_GROUPS ||--o{ RESEARCH_GROUP_MEMBERS : group_id
    USERS ||--o{ RESEARCH_GROUP_MEMBERS : user_id
    RESEARCH_GROUPS ||--o{ GROUP_INVITATIONS : group_id
    USERS ||--o{ GROUP_INVITATIONS : sender_id
    USERS ||--o{ GROUP_INVITATIONS : receiver_id
    RESEARCH_GROUPS ||--o{ GROUP_FILES : group_id
    USERS ||--o{ GROUP_FILES : uploaded_by
    RESEARCH_GROUPS ||--o{ MEETINGS : group_id
    USERS ||--o{ MEETINGS : created_by
    RESEARCH_GROUPS ||--o{ CHAT_MESSAGES : group_id
    USERS ||--o{ CHAT_MESSAGES : sender_id
    USERS ||--o{ DIRECT_CONVERSATIONS : user1_id
    USERS ||--o{ DIRECT_CONVERSATIONS : user2_id
    DIRECT_CONVERSATIONS ||--o{ DIRECT_MESSAGES : conversation_id
    USERS ||--o{ DIRECT_MESSAGES : sender_id
    USERS ||--o{ FRIEND_REQUESTS : sender_id
    USERS ||--o{ FRIEND_REQUESTS : receiver_id
    USERS ||--o{ VERIFICATION_DOCUMENTS : user_id
    USERS ||--o{ VERIFICATION_DOCUMENTS : verified_by
    USERS }o--o| USERS : verified_by

    USERS { int id PK; string email UK; string role; int institution_id FK; string verification_status; boolean is_verified; string account_status }
    INSTITUTIONS { int id PK; string aishe_code UK; string name; string state; string country }
    PUBLICATIONS { int id PK; int researcher_id FK; int institution_id FK; int conference_id FK; int selected_reviewer_id FK; int reviewed_by FK; string title; string status }
    CITATIONS { int id PK; int citing_publication_id FK; int cited_publication_id FK }
    CONFERENCES { int id PK; int created_by FK; string name; date start_date; date end_date }
    CONFERENCE_REGISTRATIONS { int id PK; int conference_id FK; int user_id FK }
    CONFERENCE_MEETING_DETAILS { int id PK; int conference_id FK; string conference_type; string meeting_link }
    NOTIFICATIONS { int id PK; int user_id FK; string notification_type; boolean is_read }
    ACTIVITY_EVENTS { int id PK; int user_id FK; string event_type }
    MODERATION_EVENTS { int id PK; int target_user_id; int moderator_id FK; string action }
    RESEARCH_GROUPS { int id PK; int created_by FK; string name; string visibility }
    RESEARCH_GROUP_MEMBERS { int id PK; int group_id FK; int user_id FK; string role }
    GROUP_INVITATIONS { int id PK; int group_id FK; int sender_id FK; int receiver_id FK; string status }
    GROUP_FILES { int id PK; int group_id FK; int uploaded_by FK; string storage_path UK }
    MEETINGS { int id PK; int group_id FK; int created_by FK; date meeting_date; string status }
    CHAT_MESSAGES { int id PK; int group_id FK; int sender_id FK; string message }
    DIRECT_CONVERSATIONS { int id PK; int user1_id FK; int user2_id FK }
    DIRECT_MESSAGES { int id PK; int conversation_id FK; int sender_id FK; boolean is_read }
    FRIEND_REQUESTS { int id PK; int sender_id FK; int receiver_id FK; string status }
    VERIFICATION_DOCUMENTS { int id PK; int user_id FK; int verified_by FK; string status }
```

## Authentication and verification flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant A as FastAPI /auth
    participant DB as SQLAlchemy database
    B->>A: POST /auth/register
    A->>DB: Validate email and create bcrypt-hashed account
    DB-->>A: User record
    A-->>B: Registration response
    B->>A: POST /auth/login
    A->>DB: Find user and verify bcrypt password
    A-->>B: access_token + user data
    B->>B: Store token/user in sessionStorage
    B->>A: Protected request with Bearer token
    A->>A: Decode JWT, find user, enforce account status
    A-->>B: Protected response or 401/403
```

JWTs use HS256 and have a 24-hour expiry. The secret is read from `SCNA_SECRET_KEY`, with a development fallback; production startup requires the variable. Passwords are hashed with bcrypt. Non-admin users must pass the verification workflow before protected feature dependencies allow access. On login, the frontend checks `/verification/status` and routes to `/dashboard`, `/verification-pending`, or `/verification`. Logout is implemented by clearing session storage in the navigation component; the frontend does not call a server-side token-revocation endpoint.

## Researcher profile flow

`Profile.jsx` loads `GET /researcher/{user_id}` on mount, normalizes institution text, and maps returned fields into local React state. `InstitutionSearch.jsx` debounces searches to `GET /institution/search`, displays matching institution names, and returns the selected record through `onSelect`. Saving uses `POST /researcher/create` when no profile exists and `PUT /researcher/{user_id}` otherwise. The payload includes phone, department, institution, AISHE code, state, district, pincode, institution type, country, designation, research interests, skills, biography, LinkedIn, ORCID, and Google Scholar. Deletion calls `DELETE /researcher/{user_id}`.

The repository verifies the frontend state update and API calls. It does not contain an independent end-to-end browser test proving every institution field is persisted for every database backend.

## Collaboration workflow

```mermaid
flowchart TD
    A[Researcher A searches researchers] --> B[POST /friends/send-request]
    B --> C[friend_requests row: Pending]
    C --> D[Notification and activity event for Researcher B]
    D --> E{B accepts or rejects}
    E -->|Accept| F[PUT /friends/accept/{request_id}]
    F --> G[Request becomes Accepted]
    G --> H[GET /friends/list/{user_id} and /collaborations page]
    E -->|Reject| I[PUT /friends/reject/{request_id}]
```

This is the verified direct collaboration-request flow. Group collaboration is separate: a group owner sends `/group-invitations/send`, the recipient accepts or rejects, and membership is recorded in `research_group_members`. No separate collaboration workspace table was verified.

## Verified API reference

All routes below are declared in `backend/routers/` and included by `backend/main.py`. Authentication is summarized as Public, Bearer, Verified, Permission, or Owner/Admin; exact dependency behavior remains enforced by the code.

### Authentication and researcher

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Register an account |
| POST | `/auth/login` | Public | Authenticate and return JWT/user data |
| POST | `/auth/forgot-password` | Public | Password-recovery request endpoint |
| GET/PUT/DELETE | `/auth/{user_id}` | Bearer/owner or admin | User record operations |
| GET | `/researcher/all` | Bearer | List researchers |
| GET | `/researcher/search` | Bearer | Search researchers |
| POST | `/researcher/create` | Bearer | Create profile |
| GET/PUT/DELETE | `/researcher/{user_id}` | Bearer/owner or admin | Profile CRUD |

### Publications, citations, reviewers, and analytics

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| POST/GET | `/publications/` | Permission/Bearer | Create/list publications |
| GET | `/publications/search` | Bearer | Search publications |
| GET | `/publications/year/{year}` | Bearer | Filter by year |
| GET | `/publications/status/{status}` | Bearer | Filter by status |
| GET | `/publications/details/{publication_id}` | Bearer | Publication details |
| GET/PUT/DELETE | `/publications/{publication_id}` | Bearer/owner or admin | Publication operations |
| POST | `/publications/upload` | Permission | Upload paper file |
| POST | `/citation/` | Verified | Create citation |
| POST | `/citation/bulk` | Verified | Create citations in bulk |
| GET | `/citation/{publication_id}` | Bearer | List citations |
| GET | `/citation/stats/{publication_id}` | Bearer | Citation statistics |
| GET | `/citation/format/{publication_id}` | Bearer | Formatted citation |
| DELETE | `/citation/{citation_id}` | Verified/owner | Delete citation |
| GET | `/reviewer/available` | Permission | Available reviewers |
| GET | `/reviewer/publications` | Reviewer | Assigned publications |
| PUT | `/reviewer/approve/{publication_id}` | Reviewer | Approve publication |
| PUT | `/reviewer/reject/{publication_id}` | Reviewer | Reject publication |
| GET | `/analytics/overview` | Verified | Overview analytics |
| GET | `/analytics/network` | Verified | Network analytics |

### Collaboration, groups, chat, meetings, and files

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| POST | `/friends/send-request` | Verified | Send collaboration request |
| GET | `/friends/requests/{user_id}` | Verified | Incoming requests |
| GET | `/friends/sent/{user_id}` | Verified | Sent requests |
| PUT | `/friends/accept/{request_id}` | Verified | Accept request |
| PUT | `/friends/reject/{request_id}` | Verified | Reject request |
| GET | `/friends/list/{user_id}` | Verified | Accepted collaborators |
| POST | `/groups/create` | Permission | Create group |
| GET | `/groups/` or `/groups/search` | Verified | List/search groups |
| GET | `/groups/{group_id}`, `/groups/{group_id}/members` | Verified/member | Group details/members |
| GET | `/groups/my/{user_id}` | Verified | User's groups |
| PUT/DELETE | `/groups/{group_id}` | Owner/Admin permission | Update/delete group |
| DELETE | `/groups/{group_id}/members/{user_id}` | Owner/Admin | Remove member |
| DELETE | `/groups/{group_id}/leave/{user_id}` | Verified | Leave group |
| POST | `/group-invitations/send` | Permission | Send group invitation |
| GET | `/group-invitations/user/{user_id}`, `/group-invitations/status` | Verified | User invitations/status |
| GET | `/group-invitations/available-groups/{receiver_id}` | Verified | Available groups |
| PUT | `/group-invitations/accept/{invitation_id}` | Verified | Accept invitation |
| PUT | `/group-invitations/reject/{invitation_id}` | Verified | Reject invitation |
| POST/GET | `/chat/send`, `/chat/group/{group_id}` | Verified/member | Group messages |
| POST/GET/DELETE | `/private-chat/send`, `/private-chat/{conversation_id}`, `/private-chat/{message_id}` | Verified | Direct messaging |
| POST/GET/PUT/DELETE | `/meetings/create`, `/meetings/group/{group_id}`, `/meetings/{meeting_id}` | Permission/member | Group meeting CRUD |
| POST/GET/DELETE | `/group-files/upload/{group_id}`, `/group-files/group/{group_id}`, `/group-files/download/{file_id}`, `/group-files/{file_id}` | Verified/member | Group-file operations |

### Institutions and conferences

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| POST/GET | `/` and `/` (institution router) | Admin/Public | Create/list institutions |
| GET | `/institution/search`, `/institution/search/details` | Public | Search institutions |
| GET | `/institution/details/{institution_id}`, `/institution/{institution_id}` | Public | Institution details |
| PUT/DELETE | `/institution/{institution_id}` | Institution permission | Update/delete institution |
| POST/GET | `/conference/` | Researcher/Bearer | Create/list conferences |
| GET | `/conference/search`, `/conference/details/{conference_id}`, `/conference/details-legacy/{conference_id}`, `/conference/{conference_id}` | Public/Bearer | Search/details |
| POST/GET | `/conference/{conference_id}/register`, `/conference/{conference_id}/registration` | Verified | Register/check registration |
| PUT/DELETE | `/conference/{conference_id}` | Owner/Admin permission | Update/delete conference |

The institution router itself has no prefix, but `backend/main.py` includes it with the `/institution` prefix. Therefore its create/list/get routes are mounted as `/institution/` and `/institution/{institution_id}`, while search/details routes are mounted as `/institution/search`, `/institution/search/details`, and so on.

### Dashboard, verification, faculty, and administration

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/dashboard/notifications`, `/dashboard/activity`, `/dashboard/overview`, `/dashboard/stats/{user_id}` | Verified | Dashboard data |
| PUT/DELETE | `/dashboard/notifications/{notification_id}/read`, `/dashboard/notifications/read-all`, `/dashboard/notifications/{notification_id}` | Verified | Notification management |
| POST | `/verification/upload` | Bearer | Upload verification document |
| GET | `/verification/my-status`, `/verification/status`, `/verification/pending`, `/verification/document/{verification_id}` | Bearer/Faculty | Verification status/documents |
| PUT | `/verification/approve/{verification_id}`, `/verification/reject/{verification_id}` | Faculty/Admin | Review document |
| GET | `/faculty/dashboard`, `/faculty/researchers`, `/faculty/students` | Faculty | Faculty views |
| PUT | `/faculty/researcher/{user_id}`, `/faculty/student/{user_id}`, `/faculty/institution` | Faculty | Faculty updates |
| GET | `/admin/dashboard`, `/admin/users`, `/admin/institutions`, `/admin/publications`, `/admin/moderation-history` | System Admin | Admin views |
| PUT/POST/DELETE | `/admin/users/{user_id}/status`, `/admin/users/{user_id}/warn`, `/admin/broadcast`, `/admin/users/{user_id}`, `/admin/users/{user_id}/role` | System Admin | Moderation/admin actions |
| PUT/DELETE | `/admin/institution/{institution_id}`, `/admin/publication/{publication_id}` | System Admin | Admin entity management |
| POST | `/admin/transfer-ownership` | System Admin | Transfer admin ownership |
| GET | `/search/global` | Bearer | Cross-entity search |

## Major user workflows

### Publication and conference workflow

```mermaid
flowchart LR
    P[Verified researcher] --> C[POST /publications/]
    C --> U[Optional /publications/upload]
    U --> R[Reviewer assignment/review]
    R --> D[Approve or reject]
    P --> CI[Citation create/bulk/statistics]
    P --> CO[Create conference]
    CO --> MT[Meeting details]
    MT --> REG[User registration]
```

### Group and chat workflow

```mermaid
flowchart LR
    O[Verified researcher] --> G[Create research group]
    G --> I[Invite user]
    I --> M[Accepted membership]
    M --> F[Shared files]
    M --> H[Group chat]
    M --> T[Schedule meeting]
```

## Development journey and repository history

The current dependency and entry-point files verify Python/FastAPI, React/Vite, SQLAlchemy, SQLite fallback, PostgreSQL support, and Supabase integration. Git history contains commits for authentication/verification/permissions/reviewer work, private chat, search, collaboration, and citations. The current branch is `group-1`; local and remote branch listings show a number of mentor/developer branches and remotes.

The repository contains Flask-related packages in the broad root `requirements.txt`, but the active application entry point and registered API are FastAPI. A complete historical Flask-to-FastAPI migration rationale could not be verified from the repository. Likewise, Git metadata verifies branch names and commit history but does not verify a complete pull-request/merge policy or every contributor's responsibilities.

## Problems encountered and repository-grounded solutions

| Problem | Verified evidence | Solution/status |
|---|---|---|
| Existing databases lacked newly added user/profile columns | Startup migration functions and `TODO.md` document added profile, verification, and moderation fields | SQLite column backfill and PostgreSQL `ADD COLUMN IF NOT EXISTS` statements were added; profile schemas/CRUD were updated |
| `create_all()` does not alter existing tables | Explicit comments and migration code in `backend/main.py` | Compatibility migration runs at startup; Alembic remains a future improvement |
| Unauthorized publication changes | `require_publication_owner` and security contract tests | Owner/admin checks reject non-owners with 403 |
| Role and verification access control | `ROLE_PERMISSIONS`, `require_permission`, `require_verified_user`, `ProtectedRoute` | Backend checks role, account status, and verification; frontend mirrors navigation guards |
| Duplicate System Admin accounts | Partial unique index in `User` and startup index creation | Database-level uniqueness plus API logic |
| CORS between local Vite and API ports | Current explicit CORS allow-list in `backend/main.py` | Local origins 5173–5177 and localhost/127.0.0.1 are allowed |
| Group files need controlled sharing | `backend/services/storage.py` and group-file router | Unique Supabase object paths and expiring signed URLs |
| Reminder generation | Startup/shutdown scheduler and security contract test | Periodic 60-second task creates due meeting/conference notifications |
| FastAPI/Uvicorn availability, email-validator errors, white-screen incidents, and exact historical profile-save/network incidents | No issue log or commit-level error evidence was found in the current repository | **This could not be verified from the current repository.** The current dependency files do include `uvicorn` and `email-validator`; the current CORS and profile API code are documented above |

## Testing and debugging

Verified automated tests are in `backend/tests/test_security_contracts.py`. They test System Admin wildcard permissions, reviewer publication restrictions, publication ownership, moderation route contracts, reminder contracts, and conference registration route presence. `backend/test_storage.py` also exists, but execution results were not verified during documentation generation.

The source includes frontend `console.log`, browser alerts, Axios error handling, loading states, and backend logging for selected operations. These support manual debugging. No frontend unit-test suite, browser end-to-end suite, CI configuration, or coverage report was verified. Database verification can be performed through the configured database and API, but no complete integration-test report is stored in the repository.

## Current development checkpoint

The current repository has progressed beyond the historical collaboration checkpoint: it contains publications/review, citations, conferences/registration, groups/invitations/files/meetings, direct chat, verification, moderation, and analytics modules. The historical statement that “My Collaborations” was the next planned page is no longer current; `client/src/pages/Collaborations.jsx` and `/friends/list/{user_id}` are present. A separate collaboration workspace backend could not be verified.

## Security considerations

- Passwords are hashed and verified with bcrypt.
- JWT bearer tokens authenticate protected API requests.
- JWT expiry is 24 hours; the signing key is environment-configured for production.
- Role, verification, account-status, and ownership checks are implemented in backend dependencies/routes.
- Pydantic validates request bodies and SQLAlchemy supplies ORM/parameterized database access.
- CORS is configured, but the local allow-list should be narrowed for deployment.
- Secrets are loaded from environment variables and `.env` files are ignored by Git. No secret values are reproduced in this README.
- Uploaded document access requires appropriate route/storage handling; a production deployment should additionally add file validation, size limits, virus scanning, and hardened storage policies.

## Performance and scalability

The current design is a synchronous SQLAlchemy/FastAPI API with a periodic in-process reminder task and frontend-side API calls. It is appropriate for development and academic demonstration. Production-scale throughput, multi-instance scheduler correctness, query latency, and storage performance were not benchmarked and therefore are not claimed. Alembic migrations, pagination/index review, background job infrastructure, centralized logging/monitoring, rate limiting, and a distributed reminder worker are suitable next steps.

## Git and team workflow

Git metadata verifies the active `group-1` branch, a `backup-before-rebase` local branch, origin/mentor remotes, and multiple remote developer/mentor branches. The log contains merge commits and feature commits. The repository does not verify the team's complete pull-request review rules, commit convention, or individual contributor mapping; those details should be filled in from the team's GitHub history if required for submission.

## Lessons learned supported by the repository

- Keep API routers, schemas, models, services, and frontend service clients separated by feature.
- Treat backend authorization as authoritative even when frontend routes hide controls.
- Use explicit migrations when a database schema evolves; `create_all()` alone is not a migration system.
- Make relationships and role constraints explicit in the schema and tests.
- Centralize token attachment and 401 handling in the API client.
- Use signed URLs and unique object paths when sharing private files.
- Verify historical claims against source code before presenting them as implemented functionality.

## Current status and conclusion

SCNA currently provides a broad, modular collaboration platform with active FastAPI routers and a React/Vite client. Core authentication, profiles, institutions, collaboration requests, notifications, publications, citations, review, groups, chat, conferences, verification, moderation, and analytics are represented in the current implementation. The project is best described as a functional academic prototype/development system rather than a production-hardened platform: automated coverage, migration tooling, deployment controls, and performance validation remain incomplete.

## Contributors

Git remotes and branch names identify repository participants, but the current repository does not provide a reliable contributor-to-feature mapping. No individual names are invented here. For a final academic submission, use the repository's verified GitHub contributors or the team's approved project record to complete this section.

## Docker Setup

Docker preparation preserves the existing repository layout. The active React application remains in `client/`; the separate `frontend/` directory is preserved as an unreferenced Vite starter/template. The Compose stack contains a React/Nginx frontend, FastAPI backend, and PostgreSQL database.

```mermaid
flowchart TD
    B[Browser] --> F[frontend\nReact build served by Nginx :8080]
    B -->|VITE_API_URL| A[backend\nFastAPI :8000]
    A --> P[(postgres\nPostgreSQL 16)]
    A --> S[Supabase Storage\ngroup-files bucket]
    A --> U[(paper_uploads volume\n/uploads/papers)]
    P --> V[(postgres_data volume)]
```

### Prerequisites

- Docker Desktop or Docker Engine with the Compose plugin.
- A Supabase project and `group-files` bucket if group-file features are required. The current storage module requires Supabase credentials during backend startup.
- No local Python virtual environment or Node.js installation is needed to run the Compose services, although both remain useful for non-Docker development.

### Environment setup

Copy the safe template and fill in values locally. Do not commit the resulting file:

```powershell
Copy-Item .env.example .env
```

Set at least:

```text
POSTGRES_DB=         # database name used by the postgres container
POSTGRES_USER=       # database user
POSTGRES_PASSWORD=   # local database password
SCNA_DATABASE_URL=   # postgresql+psycopg2://<user>:<password>@postgres:5432/<database>
SCNA_SECRET_KEY=     # long random JWT signing key
SCNA_CORS_ORIGINS=   # http://localhost:8080
SUPABASE_URL=        # Supabase project URL
SUPABASE_KEY=        # Supabase storage key
VITE_API_URL=        # http://localhost:8000
```

`VITE_API_URL` is compiled into the browser bundle, so it must be a URL reachable by the user's browser. The Docker Compose design uses `http://localhost:8000`, not the internal service name `http://backend:8000`; `backend` is reachable only from other containers, while the React app's Axios requests run in the browser.

### Build and start

```powershell
docker compose config
docker compose build
docker compose up
```

Open:

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:8000`
- FastAPI documentation: `http://localhost:8000/docs`

The backend waits for PostgreSQL's health check before starting. SQLAlchemy creates the current tables at backend startup; this project does not yet use Alembic migrations. PostgreSQL data is stored in the named `postgres_data` volume. Paper uploads are stored in the named `paper_uploads` volume. Group files remain in Supabase Storage.

### Stop and inspect

```powershell
docker compose down       # stop containers and keep named volumes
docker compose ps
docker compose logs backend
```

To remove the database and paper-upload volumes as well, use `docker compose down -v`. This is destructive to the Docker-managed data and should only be done when that data is no longer needed.

### Troubleshooting

- If Compose reports missing variables, copy `.env.example` to `.env` and fill every required value.
- If the backend fails while importing storage code, verify `SUPABASE_URL`, `SUPABASE_KEY`, and the Supabase `group-files` bucket.
- If the browser reports CORS errors, set `SCNA_CORS_ORIGINS=http://localhost:8080` and ensure `VITE_API_URL` points to the browser-accessible backend URL.
- If the frontend shows an API network error, do not use `http://backend:8000` as `VITE_API_URL`; use the host-published URL such as `http://localhost:8000`.
- If data disappears, confirm that the named volumes are still present and that `docker compose down -v` was not used.
- The Compose setup uses PostgreSQL, while ordinary development without `SCNA_DATABASE_URL` still uses the existing SQLite file. Moving existing SQLite records into PostgreSQL is a separate migration task and is not performed automatically.

### Docker deployment status

The repository now contains Dockerfiles and a Compose definition for local Docker development. Render deployment has not been performed or verified in this environment, so the project should be considered Docker-ready for review/testing but not yet certified as Render-ready. Production concerns still requiring deployment validation include real secret management, Supabase configuration, exact CORS origins, database migration strategy, health checks, TLS/custom domains, and persistent/object storage policies.

## License

This project is distributed under the MIT License. See [LICENSE](LICENSE) for the full text.
## Authentication and security additions

SCNA supports bcrypt password registration/login, generic authentication errors, rate-limited passwordless email OTP login, and authenticator-app TOTP MFA. OTP and security email delivery use the configured SMTP service.

CAPTCHA has two explicit modes. `CAPTCHA_MODE=development` uses a server-generated, expiring, single-use CAPTCHA challenge at `GET /auth/captcha` for local testing. `CAPTCHA_MODE=recaptcha` renders the Google reCAPTCHA v2 checkbox in the browser and verifies its token server-side using `CAPTCHA_SECRET_KEY`; the secret is never sent to the browser. `CAPTCHA_SITE_KEY` is public/frontend-safe and is supplied as a Vite Docker build argument. `CAPTCHA_REQUIRED=true` blocks registration, password login, and OTP requests until CAPTCHA is valid. Development CAPTCHA must not be treated as production protection.

If SMTP is not configured, SCNA returns a safe email-delivery failure and does not authenticate an OTP request without sending the code. Configure `SMTP_*`, `CAPTCHA_*`, and `AI_*` values in the ignored environment file; never place credentials in this repository.

Provider setup requires real values only in ignored `backend/.env`: SMTP host/port/username/password/from address (with `SMTP_USE_TLS` or `SMTP_USE_SSL`), production CAPTCHA site/secret keys and verification URL, and AI provider/base URL/API key/model. `GET /auth/email/status` and `GET /ai/status` expose configuration status only, never credentials. Provider-backed flows are not live until those values are configured.

Registration passwords must be at least 8 characters. No uppercase, lowercase, number, or special-character rule is required.

## SCNA Research AI

Verified users can open `/research-ai` to ask research questions. `/ai/status` returns only availability and a safe reason such as `not_configured`; it never exposes environment variable names, keys, or stack traces. The backend sends only the authenticated user’s permitted profile/publication context to the configured OpenAI-compatible provider. `/ai/recommendations` returns candidate researchers from SCNA database records and labels the source; an unconfigured AI provider returns a professional unavailable state rather than a fabricated answer.

## Testing

Run backend contract tests with `python -m unittest discover backend/tests` and build the client with `npm run build` from `client/`. Production Docker deployments require Supabase PostgreSQL through `SCNA_DATABASE_URL`; SQLite is retained only as the legacy local-development fallback.
