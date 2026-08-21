# Scientific Collaboration Network Analyzer 🔬🌐

A modern, full-stack enterprise platform for managing academic research networks, tracking publications, facilitating inter-institutional scientific collaborations, indexing citation impacts, and leveraging AI-powered research assistance.

---

## 🌟 Key Features

### 🤖 1. AI Research Assistant *(Powered by Gemini API)*
- **Floating AI Assistant Widget**: Quick-access interactive assistant available across all platform pages.
- **Dedicated AI Hub (`/ai-assistant`)**: Ask complex scientific queries, summarize research papers, or analyze collaboration opportunities.
- **Context-Aware Assistance**: Powered by Google Gemini LLM via configurable backend endpoints (`/ai/query`, `/ai/summarize`).

### 🔔 2. Notifications & Communication Center
- **Interactive Header Bell**: Real-time notification badge counter with popover preview.
- **Dedicated Notifications Hub (`/notifications`)**: Tabbed filtering (**All**, **Unread**, **Invitations**).
- **Automated Event Triggers & WebSockets**: Instant alerts when receiving collaboration requests, project approvals, or team assignments, backed by WebSockets (`/ws/{user_id}`).

### 🤝 3. Collaboration Requests & Team Onboarding
- **Request-to-Join Workflow**: Direct application flow for researchers to join active research projects.
- **Invitation Management**: Send project invitations or co-author requests with custom notes.
- **Automated Provisioning**: One-click approval automatically provisions and assigns the researcher to the project team as a Contributor.

### 🕸️ 4. Interactive Collaboration Network Graph (`/network-graph`)
- **Visual Node Graph**: Interactive network graph visualizing relationships between researchers, institutions, co-authorships, and joint projects.
- **Filterable Views**: Drill down into specific institutions, fields of research, or collaboration strength.

### 🔍 5. Global Cross-Entity Search
- **Instant Search Modal**: Global keyboard shortcut or header search triggering cross-entity indexing.
- **Unified Results**: Search across publications, projects, researchers, institutions, and conferences simultaneously.

### 📊 6. Role-Based Dashboards (`/dashboard`)
- **Researcher View**: Personal metrics for publications, assigned projects, upcoming conferences, and co-author network.
- **Institution Admin View**: High-level departmental breakdowns, grant tracking, budget usage, and institutional research output.
- **System Admin View**: Platform-wide user metrics, database record counts, and live compliance audit logs.

### 📄 7. Publications & Document Management (`/publications`)
- **Author Ordering**: Manage author list, order, and corresponding author designations.
- **PDF Uploads**: File upload management for full-text preprints and published papers.
- **Lifecycle Statuses**: Support for `Draft`, `Submitted`, `Published`, and `Archived` publication stages.

### 🔬 8. Research Projects & Grant Tracking (`/projects`)
- **Grant & Funding Tracking**: Monitor funding agencies, project budgets, timelines, and visibility.
- **Granular Team Roles**: Assign team members as `Lead Investigator`, `Researcher`, or `Contributor`.

### 🏛️ 9. Institutions, Departments & Profiles (`/institutions`, `/profile`)
- **Hierarchical Organization**: Map institutions to academic departments and affiliated researchers.
- **Researcher Profiles**: Academic biographies, research interests, external profile links, and metrics.

### 🎙️ 10. Conferences & Events (`/conferences`)
- **Event Registration**: Track participation in international academic conferences, symposia, and workshops.

### 🔗 11. Citation Indexing & Discovery (`/citations`, `/discover`)
- **Impact Indexing**: Map relationships between citing and cited publications to evaluate academic impact.
- **Discovery Engine**: Explore trending research topics, top cited authors, and emerging interdisciplinary fields.

### 🛡️ 12. Security, Auth & Immutable Audit Logging (`/audit`)
- **Authentication**: JWT authentication with passlib/bcrypt password hashing and OTP email validation.
- **Immutable Audit Trail**: Log all system mutations (`CREATE`, `UPDATE`, `DELETE`) capturing user IDs, target entities, IP addresses, and timestamps.

### 📈 13. Reports & Custom Data Export (`/reports`)
- **Analytics Reports**: Generate custom reports on institutional output, grant performance, and collaboration trends.
- **Export Options**: Export datasets to CSV, JSON, or formatted PDF format.

---

## 🏗️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | Python 3.11 / FastAPI 0.115 | High-performance asynchronous REST API framework |
| **ORM & Database** | SQLAlchemy 2.0 / PostgreSQL 15 | Relational data model with migration support & connection pooling |
| **Auth & Security** | PyJWT / Passlib (Bcrypt) / OTP | JSON Web Tokens, password hashing, and email OTP verification |
| **AI Integration** | Google Gemini API (`google-genai`) | LLM model integration for paper summaries and research queries |
| **Frontend** | React 19 / Vite 8 / React Router 7 | Modern Single Page Application (SPA) architecture |
| **Styling** | Vanilla CSS (Glassmorphism) | Custom modern design system with dynamic animations & dark components |
| **HTTP & State** | Axios / React Context API | API client with interceptors and global authentication state |
| **Containerization** | Docker & Docker Compose | Containerized PostgreSQL, FastAPI backend, and NGINX frontend |

---

## 📁 Project Architecture

```
Scientific-Collaboration-Network-Analyzer-Group-1/
├── docker-compose.yml          # Multi-container orchestration (DB, Backend, Frontend)
├── .dockerignore
├── README.md
├── COLLABORATION_FEATURES.md
├── Backend/
│   ├── Dockerfile              # Python 3.11 FastAPI container image
│   ├── .dockerignore
│   ├── .env.example            # Backend environment configuration template
│   ├── main.py                 # FastAPI application entrypoint & middleware setup
│   ├── requirements.txt        # Backend Python dependencies
│   ├── seed_all.py             # Database seeder script
│   └── src/
│       ├── database.py         # SQLAlchemy engine & session configuration
│       ├── websocket_manager.py # WebSocket connection manager
│       ├── middleware/         # Auth & RBAC security middleware
│       ├── models/             # SQLAlchemy database models
│       ├── routes/             # API route handlers (16 modules)
│       ├── schemas/            # Pydantic validation schemas
│       └── services/           # Business logic & services
├── Frontend/
│   ├── Dockerfile              # Multi-stage Node.js build & NGINX server container
│   ├── nginx.conf              # NGINX SPA routing & reverse proxy configuration
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   └── src/
│       ├── App.jsx             # Main routing component
│       ├── api/                # Axios API services
│       ├── components/         # Reusable UI components (AppShell, GlobalSearch, Assistant)
│       ├── context/            # AuthContext & global state
│       ├── hooks/              # Custom React hooks
│       ├── pages/              # 16 Application pages
│       ├── styles/             # Modular CSS stylesheets
│       └── utils/              # Export & data utility functions
└── docs/                       # Architectural documentation & briefs
```

---

## 🚀 Quickstart & Setup

### Option A: Using Docker Compose (Recommended)

Ensure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/Scientific-Collaboration-Network-Analyzer-Group-1.git
   cd Scientific-Collaboration-Network-Analyzer-Group-1
   ```

2. **Start all services**:
   ```bash
   docker compose up --build -d
   ```

3. **Access the application**:
   - **Frontend UI**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:8000](http://localhost:8000)
   - **Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **PostgreSQL Database**: `localhost:5432`

4. **Stop services**:
   ```bash
   docker compose down
   ```

---

### Option B: Manual Local Setup

#### Prerequisites
- **Python 3.11+**
- **Node.js 18+** & `npm`
- **PostgreSQL 15+** (or Supabase URI)

#### 1. Backend Setup

```bash
cd Backend

# Create & activate a virtual environment
python -m venv .venv
# On Windows PowerShell:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment configuration file
cp .env.example .env
# Edit Backend/.env with your DATABASE_URL, SECRET_KEY, and optional AI_API_KEY / SMTP credentials.

# Seed database with sample data (optional)
python seed_all.py

# Launch FastAPI development server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
> Interactive API documentation will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

#### 2. Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
> The web application will be live at [http://localhost:5173](http://localhost:5173).

---

## 🔑 Environment Variables Configuration

### `Backend/.env`

| Variable | Required | Default / Example | Description |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | `postgresql://postgres:postgres@localhost:5432/collaboration_db` | PostgreSQL connection string |
| `SECRET_KEY` | **Yes** | `your-super-secret-jwt-key` | JWT secret key for signing tokens |
| `ALGORITHM` | No | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE` | No | `60` | Token expiration time in minutes |
| `AI_PROVIDER` | No | `gemini` | AI assistant provider |
| `AI_API_KEY` | No | `your-gemini-api-key` | Google Gemini API key for AI assistant features |
| `AI_MODEL` | No | `gemini-flash-latest` | Gemini model variant |
| `SMTP_HOST` | No | `smtp.gmail.com` | SMTP host for OTP verification emails |
| `SMTP_PORT` | No | `587` | SMTP port |
| `SMTP_USERNAME` | No | `your-email@gmail.com` | SMTP authentication username |
| `SMTP_PASSWORD` | No | `your-app-password` | SMTP password or App Password |
| `SMTP_FROM` | No | `no-reply@example.com` | Sender address for system emails |

---

## 🔐 User Roles & Permissions Matrix (RBAC)

| Feature / Action | Researcher | Institution Admin | Reviewer | System Admin |
| :--- | :---: | :---: | :---: | :---: |
| View Public Publications & Projects | ✅ | ✅ | ✅ | ✅ |
| Send & Accept Collaboration Requests | ✅ | ✅ | ✅ | ✅ |
| Access AI Research Assistant | ✅ | ✅ | ✅ | ✅ |
| View Interactive Network Graph | ✅ | ✅ | ✅ | ✅ |
| Create Publications & Upload PDFs | ✅ | ✅ | ❌ | ✅ |
| Manage Projects & Grant Allocation | ✅ | ✅ | ❌ | ✅ |
| Manage Academic Departments & Faculty | ❌ | ✅ | ❌ | ✅ |
| Export Analytics & Custom Reports | ✅ | ✅ | ✅ | ✅ |
| Access Compliance & System Audit Logs | ❌ | ✅ | ❌ | ✅ |
| System User Management & Roles | ❌ | ❌ | ❌ | ✅ |

---

## 📡 API Endpoints Reference

### Authentication & Users (`/users`)
- `POST /users/register` — Register a new user account
- `POST /users/login` — Authenticate user and return JWT access token
- `GET /users/me` — Retrieve active authenticated user profile
- `POST /users/request-otp` — Request an email OTP for password reset/verification
- `POST /users/verify-otp` — Verify OTP code

### AI Research Assistant (`/ai`)
- `POST /ai/query` — Send prompt query to Gemini AI assistant
- `POST /ai/summarize` — Generate structured summary for research publications

### Notifications (`/notifications`)
- `GET /notifications/` — List user notifications (newest first)
- `GET /notifications/unread-count` — Get total unread notifications count
- `PUT /notifications/{id}/read` — Mark notification as read
- `PUT /notifications/read-all` — Mark all notifications as read

### Collaboration Requests (`/collaboration-requests`)
- `POST /collaboration-requests/` — Create and send a new collaboration request
- `GET /collaboration-requests/incoming` — View pending incoming requests
- `GET /collaboration-requests/sent` — View sent requests
- `PUT /collaboration-requests/{id}/accept` — Accept request (auto-assigns user to project team)
- `PUT /collaboration-requests/{id}/decline` — Decline request

### Research Projects & Grants (`/projects`)
- `GET /projects/` — List research projects (with search & filters)
- `POST /projects/` — Create a new research project
- `GET /projects/{id}` — Retrieve project details & team member roster
- `PUT /projects/{id}` — Update project metadata & grant status
- `POST /projects/{id}/members` — Assign team member with specific role
- `DELETE /projects/{id}/members/{researcher_id}` — Remove member from project team

### Publications (`/publications`)
- `GET /publications/` — Query publications repository
- `POST /publications/` — Create publication entry
- `POST /publications/{id}/upload-pdf` — Upload full publication PDF document
- `GET /publications/{id}` — Get detailed publication information & author list

### Institutional Partnerships (`/collaborations`)
- `GET /collaborations/` — List inter-institutional partnerships
- `POST /collaborations/` — Form new institutional partnership

### Institutions & Departments (`/institutions`, `/departments`)
- `GET/POST /institutions/` — Manage university/research institutions
- `GET/POST /departments/` — Manage academic departments within institutions

### Researchers & Profiles (`/researchers`)
- `GET /researchers/` — List registered researchers
- `GET /researchers/{id}` — View researcher profile, publications, & network connections
- `PUT /researchers/{id}` — Update researcher bio, field of study, & skills

### Conferences (`/conferences`)
- `GET/POST /conferences/` — Manage academic conferences and symposia
- `POST /conferences/{id}/register` — Register researcher attendance

### Citations & Network (`/citations`, `/search`)
- `GET/POST /citations/` — Index and query citation connections between papers
- `GET /search/global` — Cross-entity global search endpoint

### Audit, Analytics & Dashboard (`/audit`, `/report`, `/dashboard`)
- `GET /dashboard/stats` — Get role-tailored dashboard metrics
- `GET /audit/` — Retrieve immutable system audit log entries (Admins only)
- `GET /report/summary` — Generate analytics reports with CSV/PDF data export

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
