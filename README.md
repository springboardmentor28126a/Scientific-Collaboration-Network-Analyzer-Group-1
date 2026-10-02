# Scientific Collaboration Network Analyzer

## Project Overview

The Scientific Collaboration Network Analyzer is a web-based platform designed to manage and analyze research collaboration activities.

The system helps researchers and institutions manage:

- Researchers
- Publications
- Conferences
- Collaborations
- Projects
- Institutions
- Reviews
- Citations
- Notifications
- Reports and analytics

The application provides dashboards and APIs for managing scientific collaboration information in a centralized system.

---

## Technologies Used

### Backend
- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- Passlib

### Frontend
- React
- React Bootstrap
- Bootstrap
- React Icons
- Recharts

### Deployment
- Docker
- Docker Compose

---

## Main Modules

### 1. Authentication
- User registration
- User login
- Password hashing
- Role-based user information

### 2. Researcher Management
- Add researchers
- View researchers
- Update researcher information
- Delete researchers

### 3. Publication Management
- Add publications
- View publications
- Search publications
- Filter publications by status
- Sort publications by year
- Update publications
- Delete publications
- Upload publication files

### 4. Review Management
- View publications under review
- Claim publications for review
- Approve or reject publications
- Add review comments and scores

### 5. Collaboration Management
- Create collaborations
- View collaborations
- Update collaborations
- Delete collaborations
- Track collaboration status

### 6. Conference Management
- Add conferences
- View conferences
- Update conference information
- Delete conferences

### 7. Project Management
- Add research projects
- View projects
- Update projects
- Delete projects

### 8. Institution Management
- Add institutions
- View institutions
- Update institutions
- Delete institutions

### 9. Citation Management
- Add citations
- View citations
- Update citations
- Delete citations

### 10. Notifications
- Generate notifications
- View notifications
- Mark notifications as read

### 11. Reports and Dashboard
- Researcher statistics
- Publication statistics
- Conference statistics
- Collaboration statistics
- Project statistics
- Institution statistics
- Review statistics
- Publication charts

---

## Project Structure

```text
Scientific-Collaboration-Network-Analyzer/
│
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── security.py
│   ├── auth.py
│   ├── researcher.py
│   ├── publication.py
│   ├── conference.py
│   ├── collaboration.py
│   ├── project.py
│   ├── review.py
│   ├── institution.py
│   ├── citation.py
│   ├── notification.py
│   ├── report.py
│   ├── upload.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
│
├── docs/
│   ├── DatabaseSchema.md
│   └── Requirements.md
│
├── docker-compose.yml
├── README.md
└── .gitignore