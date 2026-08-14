# Scientific Collaboration Network Analyzer

A full-stack research management platform for connecting researchers, managing publications, tracking citations, coordinating projects, and reviewing research activity. The project is designed as a practical academic collaboration system with authenticated, role-based workflows and database-backed analytics.

## Features

- JWT-based authentication and role-based access control
- Researcher profiles, institutions, and searchable researcher directory
- Publication management with PDF uploads
- Structured references, DOI/URL validation, and citation relationships
- Project-based collaboration requests with accept/reject workflow
- Real-time and in-app notifications
- Conferences, reviews, citations, reports, and dashboard analytics
- AI-assisted researcher and publication recommendations using explainable TF-IDF similarity
- Administrator role-request approval, rejection reasons, and request history

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, React Router, Axios, Bootstrap, Recharts |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL (production-ready) or SQLite (local default) |
| Authentication | JWT with OAuth2 password flow |
| Real-time updates | WebSockets |
| AI recommendations | Deterministic TF-IDF and cosine similarity |

## Project Structure

```text
backend/
  app/
    routes/                 API modules
    models.py               SQLAlchemy models
    schemas.py              Pydantic request/response schemas
    recommendation_service.py
    auth.py                 JWT and password utilities
    main.py                 FastAPI application entry point
  requirements.txt

frontend/
  src/
    pages/                  Application pages
    components/             Shared UI components
    context/                Authentication and WebSocket contexts
    config/api.js           Axios API client
  package.json
```

## Prerequisites

- Python 3.10 or newer
- Node.js 18 or newer
- npm
- PostgreSQL, if not using the local SQLite fallback

## Installation and Setup

### 1. Configure the backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create `backend/.env` from the following template. Never commit a real `.env` file.

```env
DATABASE_URL=sqlite:///./collaboration.db
SECRET_KEY=replace-with-a-long-random-secret
ADMIN_SETUP_KEY=replace-with-a-separate-admin-setup-secret
```

For PostgreSQL, set `DATABASE_URL` to the appropriate SQLAlchemy PostgreSQL connection string.

Start the API:

```powershell
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. Interactive API documentation is available at `http://localhost:8000/docs`.

### 2. Configure and start the frontend

```powershell
cd frontend
npm install
```

Create `frontend/.env`:

```env
REACT_APP_API_BASE_URL=http://localhost:8000
```

Start the React application:

```powershell
npm start
```

Open `http://localhost:3000` in a browser.

## Main Workflows

### Role request and approval

1. A user registers and creates a researcher profile.
2. An elevated role request is stored with `pending` status.
3. A system administrator reviews the request and available profile information.
4. The administrator approves it or rejects it with a reason.
5. A rejected user can correct their profile and resubmit; the previous request remains in history.

### Project-based collaboration

1. A researcher opens an AI match, directory entry, or researcher profile.
2. Selecting **Collaborate** opens **Select a Project**; it does not create a request.
3. The sender selects an owned project, enters an optional message, and submits.
4. The recipient receives a pending collaboration request and notification.
5. On acceptance, the recipient is added to the selected project through `ProjectMember`.
6. On rejection, no project membership is created.

### AI recommendations

Recommendations are generated from real profile fields and stored publication text. The service combines:

- TF-IDF vectors of interests, skills, bios, titles, and abstracts
- cosine similarity for meaningful text similarity
- direct interest and skill overlap for explainable matches

No external AI service, API key, random score, or fake researcher data is used. Recommendation responses include score, overlapping topics, relevant publications, and a short reason.

### Citations and references

- A citation links one stored publication to another.
- Self-citations and duplicate citation pairs are blocked by backend validation.
- Citation count is calculated from actual incoming citation records.
- Publication details show references and a **Cited By** list.
- DOI values and URLs are validated before structured references are saved.

## Important API Endpoints

| Area | Endpoint | Purpose |
| --- | --- | --- |
| Authentication | `POST /auth/register`, `POST /auth/login` | Register and sign in |
| Profiles | `GET/PUT /researchers/profile/me` | View or update own profile |
| Role requests | `GET /researchers/profile/me/role-requests` | View request history |
| Role requests | `POST /researchers/profile/me/role-requests/{id}/resubmit` | Resubmit a rejected request |
| Admin | `GET /admin/role-requests` | Review role requests |
| Admin | `PATCH /admin/role-requests/{id}` | Approve/reject a request |
| AI | `GET /ai/researcher-recommendations` | Researcher matches |
| AI | `GET /ai/publication-recommendations` | Publication recommendations |
| Collaboration | `GET /collaborations/projects/eligible-to-invite` | Selectable owned projects |
| Collaboration | `POST /collaborations/request` | Create pending project invitation |
| Collaboration | `PATCH /collaborations/{id}/accept` | Accept and add member |
| Collaboration | `PATCH /collaborations/{id}/reject` | Reject invitation |
| Citations | `GET /citations/publications/{id}/cited-by` | List incoming citations |

All personalised endpoints require a valid `Authorization: Bearer <JWT>` header.

## Security Notes

- Never place backend secrets or database credentials in frontend code.
- Keep `.env` files out of version control.
- The backend derives the requesting user from the JWT; it never trusts a frontend-provided sender ID.
- Project invitations validate project ownership, membership, target identity, and duplicate requests server-side.
- Institution administrator reporting is scoped from the authenticated administrator’s assigned institution.
- Private publication drafts are excluded from other users’ AI recommendations.

## Challenges Faced and How They Were Overcome

| Challenge | Approach used |
| --- | --- |
| Preventing direct or duplicate collaboration requests | Reused `CollaborationRequest` and required `project_id`; server checks reject self-invites, non-owners, existing members, duplicate pending requests, and repeated prior requests. |
| Adding AI without unreliable or expensive external calls | Implemented deterministic TF-IDF/cosine scoring over existing database text. This is explainable, repeatable, offline-friendly, and suitable for a college project demonstration. |
| Preserving role-request history | Added an auditable `RoleRequest` model instead of overwriting the user’s last status. Existing user fields remain as compatibility summaries. |
| Preventing rejected users from being blocked forever | Rejection stores a reason, and resubmission creates a new pending record after checking that no other request is pending. |
| Keeping statistics genuine | Dashboard counts are calculated with database queries for users, publications, citations, collaborations, requests, and current-month activity; no sample metrics are hard-coded. |
| Protecting institution data | Institution-scoped queries derive the institution from the authenticated user instead of accepting an institution ID from the client. |
| Maintaining academic citation quality | Backend validation prevents self-links and duplicate citation pairs. DOI/URL validation prevents malformed structured reference data. |
| Integrating additions without replacing the app | New functionality extends existing FastAPI routers, SQLAlchemy models, React pages, and notification services rather than creating a separate application. |

## Testing Checklist

- Register and log in with a researcher account.
- Create researcher profiles and publications for at least two users.
- Test AI recommendation cards and confirm recommendation scores are based on stored data.
- Create a project, invite a researcher through the project-selection modal, and accept/reject from the recipient account.
- Verify duplicate invitations and already-member invitations are rejected.
- Create a citation, verify citation count and **Cited By** output, then test duplicate/self-citation validation.
- Submit a role request, approve/reject it from Admin → User Management, and test rejection resubmission/history.
- Check that institution-admin dashboard/report results are limited to the assigned institution.

## License

This project is distributed under the repository’s existing license.
