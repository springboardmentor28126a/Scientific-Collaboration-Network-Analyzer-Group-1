# Scientific Collaboration Network Analyzer

A research collaboration management platform that enables universities and research
organizations to manage publications, researchers, institutions, projects, conferences,
and collaborations — tracking co-authorship, research groups, publications, funding
projects, conference participation, citations, and institutional partnerships through a
centralized database.

## Tech Stack

- **Backend:** Python, FastAPI, SQLAlchemy, Pydantic, Uvicorn
- **Frontend:** React (Vite)
- **Database:** SQLite (dev) / PostgreSQL (planned for production)
- **Auth:** JWT

## Modules Implemented So Far

- User Management (Login, Registration, Roles: Researcher, Institution Admin, Reviewer, System Admin)
- Researcher Management (profiles, departments)
- Institution Management
- Conference Management (registration, file upload for certificates/presentations)
- File Upload & Storage

## Milestone 3 Status (Week 5-6)

Planned scope for Milestone 3 was:

- Collaboration module
- Citation management
- Reports
- Dashboards
- Notifications

**Completed in this milestone:** Reports module only.

**Moved to Future Enhancements:** Collaboration module, Citation management, Dashboards,
and Notifications — see below.

## Future Enhancements

The following items were part of the original Milestone 3 scope but were not completed in
this phase and are planned as future work:

1. **Collaboration Management Module**
   - Co-author network tracking
   - Research project creation and team management
   - Institutional collaboration records
   - Project assignments

2. **Citation & Reference Module**
   - Citation record tracking
   - Reference list management
   - Publication linking
   - DOI management

3. **Dashboards**
   - Researcher Dashboard (publications, projects, conferences, collaborators)
   - Institution Dashboard (departments, publications, active projects, collaboration stats)
   - Admin Dashboard (overall reports, institution analytics, user statistics)

4. **Notifications**
   - Email / in-app notifications for collaboration requests, conference deadlines,
     and publication status changes

5. **Additional future scope carried over from the original plan**
   - Audit & Compliance module (activity logs, security logs, compliance reports)
   - Excel/PDF export for all report types
   - Publication Management module (journal papers, conference papers, books, patents,
     technical reports, draft/submitted/published/archived status workflow)
   - Docker-based deployment and CI/CD via GitHub Actions
   - Integration with CrossRef / DOI and ORCID / Research ID services

## Getting Started

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
