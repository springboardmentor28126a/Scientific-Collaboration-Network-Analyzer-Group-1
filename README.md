# Scientific Collaboration Network Analyzer (SCNA)

> **A centralized research collaboration management platform for
> universities, research organizations, institutes, laboratories,
> publishers, and funding organizations.**

The **Scientific Collaboration Network Analyzer (SCNA)** is a full-stack
research management system designed to centralize and organize the
academic activities that are normally scattered across spreadsheets,
documents, email threads, publication repositories, conference records,
and project files.

The platform manages **users, researchers, institutions, publications,
projects, conferences, citations, collaborations, reports, audit logs,
and notifications** through a single application and relational
database.

The system is intentionally focused on **structured research management
and analytics rather than AI-based analysis**. Its value comes from
maintaining connected research data, enforcing role-based access,
tracking research activity, and turning stored data into dashboards and
reports.

------------------------------------------------------------------------

## Table of Contents

1.  [Project Title](#project-title)
2.  [Project Overview](#project-overview)
3.  [Problem Statement](#problem-statement)
4.  [Objectives](#objectives)
5.  [Key Outcomes](#key-outcomes)
6.  [Tech Stack](#tech-stack)
7.  [System Architecture](#system-architecture)
8.  [Entity Relationship Diagram](#entity-relationship-diagram)
9.  [Milestones and Week-wise
    Timeline](#milestones-and-week-wise-timeline)
10. [Module-by-Module Implementation](#module-by-module-implementation)
11. [Authentication and Security
    Implementation](#authentication-and-security-implementation)
12. [Role-Based Access Control](#role-based-access-control)
13. [Dashboard and Analytics](#dashboard-and-analytics)
14. [Reports and Export](#reports-and-export)
15. [Audit Logging](#audit-logging)
16. [Notification System](#notification-system)
17. [End-to-End Workflow](#end-to-end-workflow)
18. [Database Design](#database-design)
19. [API and Backend Structure](#api-and-backend-structure)
20. [Frontend Implementation](#frontend-implementation)
21. [Validation and Data Integrity](#validation-and-data-integrity)
22. [Development Challenges and
    Solutions](#development-challenges-and-solutions)
23. [Git and GitHub Challenges](#git-and-github-challenges)
24. [Teamwork and Collaboration
    Experience](#teamwork-and-collaboration-experience)
25. [What I Learned](#what-i-learned)
26. [Testing and Verification](#testing-and-verification)
27. [Project Structure](#project-structure)
28. [Running the Project](#running-the-project)
29. [Future Improvements](#future-improvements)
30. [Conclusion](#conclusion)

------------------------------------------------------------------------

# Project Title

## Scientific Collaboration Network Analyzer

### Short Name: SCNA

SCNA is a research collaboration management platform that connects the
major entities involved in academic research:

**Users → Researchers → Publications → Co-authors → Collaborations →
Projects → Conferences → Citations → Institutions → Reports**

Instead of treating each activity as an isolated record, the system
stores relationships between these entities so that research activity
can be viewed from multiple perspectives.

For example:

-   A researcher can have an academic profile.
-   The researcher can be associated with an institution.
-   The researcher can own or contribute to publications.
-   A publication can have multiple authors.
-   Multiple authors create measurable collaboration relationships.
-   Researchers can be assigned to research projects.
-   Researchers can participate in conferences and presentations.
-   Publications can reference other publications through citations.
-   All major operations can be recorded in audit logs.
-   Important events can generate notifications.
-   Aggregated data can be displayed through dashboards and reports.

------------------------------------------------------------------------

# Project Overview

The project was developed as a centralized research management system
for organizations that need to maintain structured information about
their research ecosystem.

The platform supports:

-   User registration and login
-   Researcher profile management
-   Institution management
-   Publication management
-   Publication PDF upload and download
-   Research project management
-   Project researcher assignments
-   Collaboration and co-author management
-   Conference management
-   Conference participation and presentation tracking
-   Citation and reference management
-   Research dashboards
-   Institutional and administrative analytics
-   Report generation
-   CSV/Excel-compatible exports
-   Client-side PDF report generation
-   Notifications
-   Audit logging
-   Role-based access control
-   Search, filtering, sorting and pagination
-   Secure password storage
-   JWT-based authentication

The application uses a relational data model because the relationships
between researchers, publications, institutions, projects, conferences
and citations are central to the problem.

------------------------------------------------------------------------

# Problem Statement

Research information is frequently distributed across multiple systems.
Researchers may maintain publication records separately from project
information, conference participation may be stored in spreadsheets,
institutional information may be maintained by administrators, and
collaboration history may be difficult to measure.

This creates several problems:

1.  Research data becomes fragmented.
2.  Collaboration relationships are difficult to track.
3.  Publication and citation information is difficult to analyze
    together.
4.  Institutional research performance is difficult to measure.
5.  Project participation is difficult to maintain consistently.
6.  Access to sensitive administrative information must be controlled.
7.  Research activity needs an accountable history.
8.  Administrators need dashboards instead of manually compiling
    statistics.

SCNA addresses these problems by providing a centralized relational
platform.

------------------------------------------------------------------------

# Objectives

The main objectives of the system are:

-   Build a research management platform.
-   Maintain a centralized publication repository.
-   Manage researcher profiles and expertise.
-   Track co-authorship and collaboration.
-   Manage research projects and researcher assignments.
-   Manage conferences and participation history.
-   Track citations and references.
-   Maintain institutional information.
-   Generate research and publication analytics.
-   Provide role-specific dashboards.
-   Provide reporting and export facilities.
-   Maintain audit trails for important actions.
-   Provide notification support for important events.
-   Protect user credentials and restricted functionality.
-   Provide a deployable backend architecture.

------------------------------------------------------------------------

# Key Outcomes

The project targets the following outcomes:

-   Research management system
-   Publication repository
-   Collaboration network management
-   Conference and project tracking
-   Institutional collaboration workflows
-   Publication analytics
-   Reporting dashboards
-   Docker-oriented deployment readiness

------------------------------------------------------------------------

# Tech Stack

## Backend

### Python

Python is used as the main programming language for API development,
database programming, authentication and application logic.

### FastAPI

FastAPI is the main backend framework and is responsible for:

-   REST API routing
-   Request validation
-   Dependency injection
-   Authentication dependencies
-   HTTP error handling
-   File upload handling
-   API documentation through OpenAPI/Swagger

The application is initialized in `app/main.py`.

### Uvicorn

Uvicorn is used as the ASGI server.

``` bash
python -m uvicorn app.main:app --reload
```

------------------------------------------------------------------------

## Database

### PostgreSQL

PostgreSQL is the relational database used by the project.

It is suitable for SCNA because the system contains relationships such
as:

-   User → Researcher
-   Researcher → Publication
-   Publication → Citation
-   Publication → Co-author
-   Project → Researcher
-   Conference → Researcher
-   Institution → Researcher

### SQLAlchemy

SQLAlchemy is used as the ORM layer for:

-   Query construction
-   CRUD operations
-   Filtering
-   Sorting
-   Aggregation
-   Foreign-key relationships
-   Database session management

### Psycopg

`psycopg[binary]` provides PostgreSQL connectivity.

------------------------------------------------------------------------

## Validation and Schemas

### Pydantic

Pydantic schemas are used for:

-   Request validation
-   Response serialization
-   Email validation
-   Structured API input
-   Consistent API contracts

------------------------------------------------------------------------

## Authentication and Security

The project uses:

-   JWT
-   OAuth2 bearer authentication
-   Passlib
-   bcrypt
-   HS256 token signing

Passwords are never stored as plaintext.

------------------------------------------------------------------------

## Frontend

The implemented frontend uses:

-   HTML
-   Jinja2 templates
-   CSS
-   JavaScript
-   Bootstrap
-   Bootstrap Icons
-   Chart.js
-   jsPDF for client-side PDF report generation

FastAPI serves the frontend templates and static assets.

The frontend communicates with backend APIs using the browser `fetch()`
API.

------------------------------------------------------------------------

## File Storage

Publication PDFs are stored using local application storage under:

``` text
app/uploads/
```

The database stores the uploaded file name/path so that the publication
record and document remain connected.

------------------------------------------------------------------------

## Development and DevOps

The project uses:

-   Git
-   GitHub
-   Postman
-   Docker-oriented deployment planning

The source repository also contains multiple development branches used
while integrating and stabilizing the implementation.

------------------------------------------------------------------------

# System Architecture

The system follows a layered architecture:

``` text
Browser
   |
   v
Jinja2 / HTML / CSS / JavaScript Frontend
   |
   v
FastAPI Application
   |
   +--> Authentication & RBAC
   |
   +--> Module Routers
   |      +--> Users
   |      +--> Researchers
   |      +--> Institutions
   |      +--> Publications
   |      +--> Projects
   |      +--> Conferences
   |      +--> Citations
   |      +--> Collaborations
   |      +--> Reports
   |      +--> Analytics
   |      +--> Audit
   |      +--> Notifications
   |
   v
SQLAlchemy ORM
   |
   v
PostgreSQL
   |
   +--> Research Data
   +--> Collaboration Data
   +--> Audit Data
   +--> Notification Data

Additional storage:
FastAPI --> Local PDF Storage --> Publication files
```

### Architecture diagram

![SCNA Architecture Diagram](docs/SCNA_Architecture_Diagram.png)

The included architecture diagram represents the implemented application
structure and the actual separation between the browser, FastAPI
routers, security layer, SQLAlchemy, PostgreSQL and file storage.

------------------------------------------------------------------------

# Entity Relationship Diagram

The relational design is the foundation of SCNA.

![SCNA Entity Relationship Diagram](docs/SCNA_ER_Diagram.png)

The ER diagram connects the major tables:

-   `users`
-   `researchers`
-   `institutions`
-   `publications`
-   `publication_authors`
-   `citations`
-   `research_projects`
-   `project_assignments`
-   `conferences`
-   `conference_participations`
-   `collaborations`
-   `audit_logs`
-   `notifications`

### Important relationship examples

#### User → Researcher

A user account can be connected to a researcher profile.

#### Researcher → Publication

A publication can reference its primary researcher and can also contain
multiple author records through `publication_authors`.

#### Publication → Citation

A citation connects a publication with a cited publication.

#### ResearchProject → ProjectAssignment → Researcher

This creates a many-to-many style relationship between projects and
researchers.

#### Conference → ConferenceParticipation → Researcher

This records researcher attendance and presentation participation.

#### Publication → PublicationAuthor → Researcher

This is the main structure used to represent co-authorship and
collaboration activity.

------------------------------------------------------------------------

# Milestones and Week-wise Timeline

The project specification divides development into four major
milestones.

## Milestone 1 --- Week 1--2

### Foundation and Core Setup

### Tasks

-   Requirement gathering
-   Database schema
-   FastAPI setup
-   Frontend setup
-   Authentication
-   Researcher profiles

### Outcomes

-   Authentication completed
-   User management functional
-   Researcher module completed

### Implementation work

I established the application structure, connected the database through
SQLAlchemy, created the core user and researcher models, implemented
registration and login, and built the researcher profile workflow.

This milestone established the foundation required by every later
module.

------------------------------------------------------------------------

# Milestone 2 --- Week 3--4

## Core Research Modules

### Tasks

-   Publication module
-   Conference module
-   Institution management
-   File uploads

### Outcomes

-   Publication repository completed
-   Conference workflows implemented
-   Institution management operational

### Implementation work

The publication system was connected with researchers and publication
authors. Conference records were extended to include participation and
presentation details. Institutions were introduced as a separate managed
entity, and publication PDFs were connected to publication records
through file upload functionality.

------------------------------------------------------------------------

# Milestone 3 --- Week 5--6

## Collaboration and Analytics

### Tasks

-   Collaboration module
-   Citation management
-   Reports
-   Dashboards
-   Notifications

### Outcomes

-   Collaboration tracking completed
-   Reporting module functional
-   Dashboards operational

### Implementation work

I implemented collaboration and co-author records, citation tracking,
summary dashboards, analytical endpoints, reports, exports and
database-backed notifications. Audit logging was also integrated into
major operations so that important actions could be traced.

------------------------------------------------------------------------

# Milestone 4 --- Week 7--8

## Stabilization and Deployment

### Tasks

-   Testing
-   Performance optimization
-   Docker deployment
-   Documentation
-   Final presentation

### Outcomes

-   Stable production deployment
-   Complete documentation
-   Successful demonstration

### Implementation work

The final stage focused on stabilizing the modules, fixing integration
issues, validating permissions, improving frontend behavior, checking
API responses, resolving database/schema mismatches, improving reporting
behavior, and preparing the complete documentation and demonstration
flow.

------------------------------------------------------------------------

# Module-by-Module Implementation

# 1. User Management Module

The User Management module is the entry point to the platform.

## Features implemented

-   User registration
-   User login
-   Email validation
-   Duplicate email checking
-   Password hashing
-   Password verification
-   JWT access token generation
-   Token verification
-   Current-user endpoint
-   Role assignment
-   Authentication guard
-   Logout
-   Role-based navigation

## Registration flow

When a user registers:

1.  The email is checked against the database.
2.  Duplicate registration is rejected.
3.  The password is hashed using bcrypt.
4.  The user record is created.
5.  The new user ID is returned.
6.  An audit event is recorded.
7.  A notification can be generated for the new registration.

The database never receives the original plaintext password.

## Login flow

The login endpoint:

1.  Searches for the user by email.
2.  Rejects unknown users.
3.  Verifies the entered password against the stored bcrypt hash.
4.  Creates a JWT token.
5.  Adds the user's email, ID and role to the token payload.
6.  Returns the bearer token.
7.  Records the login activity in the audit log.

------------------------------------------------------------------------

# 2. Researcher Management Module

The Researcher module represents the academic identity of users.

## Researcher profile fields

The researcher model contains:

-   User ID
-   Full name
-   Academic profile
-   Department
-   Institution
-   Skills
-   Research interests
-   Affiliations

## Features implemented

-   Create researcher
-   View researcher
-   Update researcher
-   Delete researcher
-   Search researchers
-   Sort researchers
-   Pagination
-   Researcher profile statistics

## Profile statistics

The profile statistics endpoint calculates:

-   Profile completion percentage
-   Publication count
-   Citation count
-   Active project count
-   Recent publications

### Why profile completion was implemented

A research profile is more useful when important academic information is
complete. The completion percentage provides a simple way to identify
incomplete researcher profiles.

### Why search and sorting were added

Research institutions may contain many researchers. Searching by name,
institution or department makes the directory usable at scale.

------------------------------------------------------------------------

# 3. Institution Management Module

Institutions are treated as first-class entities rather than storing
institutional information only as text.

## Institution fields

-   Institution name
-   Institution type
-   Country
-   City
-   Website
-   Contact email

## Features implemented

-   Create institution
-   List institutions
-   View institution
-   Update institution
-   Delete institution
-   Search
-   Sort
-   Pagination
-   Institution details

## Institution details

The details endpoint aggregates:

-   Total researchers
-   Departments
-   Total publications
-   Active projects
-   Collaboration activity
-   Sample researcher profiles

### Why institution analytics matter

The platform is designed for universities and research organizations. An
institution administrator needs to understand research activity at the
organizational level, not just individual researcher level.

------------------------------------------------------------------------

# 4. Publication Management Module

The Publication module is one of the central modules of SCNA.

## Supported publication types

The data model supports:

-   Journal papers
-   Conference papers
-   Books
-   Patents
-   Technical reports

## Publication fields

-   Researcher
-   Title
-   Authors
-   Abstract
-   Citation count
-   Publication type
-   Publication name
-   Publication year
-   DOI
-   Status
-   Upload path

## Publication status

The system supports:

-   Draft
-   Submitted
-   Published
-   Archived

## Features implemented

-   Create publication
-   Update publication
-   Delete publication
-   List publications
-   Search by title
-   Filter by type
-   Filter by status
-   Sort
-   Pagination
-   PDF upload
-   PDF download
-   Publication metrics
-   Recent publications
-   Reference access

## Validation

The publication API validates:

-   Publication year cannot be in the future.
-   Citation count cannot be negative.
-   Uploaded files must be PDF files.

### Why validation matters

Research data needs to be reliable. Allowing impossible publication
years or negative citation counts would directly corrupt analytics and
reports.

------------------------------------------------------------------------

# 5. Collaboration Management Module

The Collaboration module represents the relationship between
researchers.

The project contains both a general `collaborations` entity and a
`publication_authors` entity.

The `publication_authors` table is particularly important because it
captures actual co-author activity connected to publications.

## Publication author fields

-   Publication ID
-   Researcher ID
-   Author order
-   Contribution

## Features implemented

-   Create collaboration
-   List collaborations
-   Add co-author
-   List publication authors
-   Collaboration dashboard
-   Collaboration trend
-   Recent collaborations
-   Collaboration network generation
-   Search
-   Sort
-   Pagination

## Collaboration dashboard

The dashboard calculates:

-   Total collaboration records
-   Connected researchers
-   Number of publications represented
-   Average authors per publication

## Collaboration network

The network endpoint:

1.  Reads publication-author records.
2.  Groups researchers by publication.
3.  Finds pairs of researchers appearing on the same publication.
4.  Creates graph edges between those researchers.
5.  Creates graph nodes for participating researchers.

This converts relational co-author information into a network
representation.

### Why collaboration tracking matters

The primary purpose of SCNA is not simply to store papers. It is to
understand the research ecosystem around those papers.

Co-authorship provides a measurable representation of collaboration.

------------------------------------------------------------------------

# 6. Research Project Management Module

The Project module manages funded and institutional research projects.

## Project fields

-   Title
-   Description
-   Funding agency
-   Budget
-   Start date
-   End date
-   Status
-   Institution

## Project assignment

The `project_assignments` table connects researchers to projects.

Fields:

-   Project ID
-   Researcher ID
-   Role

## Features implemented

-   Create project
-   List projects
-   View project
-   Update project
-   Assign researcher
-   List assignments
-   Role-based project access
-   Audit logging

### Why project assignments are separate

A project can contain multiple researchers, and a researcher can
participate in multiple projects. A separate assignment table avoids
duplicating project information inside researcher records.

------------------------------------------------------------------------

# 7. Conference Management Module

The Conference module manages academic events and researcher
participation.

## Conference fields

-   Name
-   Organizer
-   Location
-   Start date
-   End date
-   Website
-   Conference type
-   Registration deadline
-   Submission deadline
-   Contact email

## Participation fields

-   Conference
-   Researcher
-   Presentation title
-   Participation type
-   Participation status
-   Presentation type
-   Presentation status
-   Presentation date
-   Presentation time
-   Session name
-   Related publication

## Features implemented

-   Create conference
-   List conferences
-   Search
-   Filter
-   Sort
-   Pagination
-   Conference status calculation
-   Conference details
-   Register participation
-   Update participation
-   Cancel participation
-   Researcher conference history
-   Conference analytics
-   Summary statistics

## Automatic conference status

Conference status is calculated from dates:

-   Upcoming
-   Ongoing
-   Completed

### Why automatic status was implemented

Conference state should not have to be manually updated every day. The
application can determine the current state from the start and end
dates.

## Validation

The system prevents:

-   End date before start date
-   Registration deadline after conference start
-   Submission deadline after conference start
-   Duplicate conference names

------------------------------------------------------------------------

# 8. Citation and Reference Module

The Citation module represents relationships between publications.

## Citation fields

-   Publication ID
-   Cited publication ID
-   Citation text
-   DOI
-   Reference order

## Features implemented

-   Create citation
-   List citations
-   View citation
-   Update citation
-   Delete citation
-   Search
-   Filtering
-   Citation analytics
-   Citation generation
-   BibTeX export
-   Reference retrieval

### Why citation management matters

Citations provide a second layer of research impact beyond publication
count.

Publication count measures output.

Citation count provides an indication of how research is being
referenced.

------------------------------------------------------------------------

# 9. Dashboard Module

The dashboard converts database records into high-level information.

## Dashboard categories

### Researcher Dashboard

Shows research activity such as:

-   Publications
-   Projects
-   Conferences
-   Collaborators

### Institution Dashboard

Provides:

-   Departments
-   Publications
-   Active projects
-   Collaboration statistics

### Admin Dashboard

Provides:

-   Overall reports
-   Institution analytics
-   User statistics

## Why dashboards were implemented

Administrators should not need to query raw database tables manually.

The dashboard acts as the first-level decision interface.

------------------------------------------------------------------------

# 10. Reports and Analytics Module

The Reports module converts research records into structured analytical
information.

## Report types

-   Publication reports
-   Research reports
-   Collaboration reports
-   Institution reports
-   Dashboard reports

## Analytics implemented

The analytics API provides aggregated data for:

-   Publications by year
-   Publications by status
-   Researchers by institution
-   Researchers by department
-   Collaborations by year
-   Conference participation status

## Chart visualization

The frontend uses Chart.js to visualize analytics.

The charts provide a faster way to understand trends than raw tables.

## Export functionality

The application provides downloadable reports for:

-   Researchers
-   Publications
-   Collaborations
-   Institutions

The server-side report endpoints return CSV files that are compatible
with spreadsheet applications.

The frontend also supports client-side PDF report generation through
jsPDF.

### Why reporting was separated from CRUD modules

CRUD endpoints manage individual records.

Reports operate on aggregated data.

Keeping those responsibilities separate makes the backend easier to
maintain and allows analytics to evolve independently.

------------------------------------------------------------------------

# 11. Audit Module

The Audit module provides accountability.

## Audit fields

-   User ID
-   Action
-   Module
-   Details
-   Created timestamp

## Audit events include

-   User registration
-   Login success
-   Login failure
-   Researcher creation/update/deletion
-   Publication creation/update
-   Conference creation
-   Collaboration creation
-   Co-author addition
-   Project creation
-   Project assignment
-   Institution changes
-   Security-related actions

## Access control

Audit log listing and individual audit record access are restricted to
the **System Admin** role.

### Why audit logging was implemented

Research management systems contain organizational data. Administrators
need to know:

-   Who performed an action?
-   Which module was affected?
-   What happened?
-   When did it happen?

This creates accountability and provides a useful debugging/security
trail.

------------------------------------------------------------------------

# 12. Notification Module

Notifications provide application-level communication.

## Notification fields

-   User ID
-   Title
-   Message
-   Type
-   Read/unread state
-   Creation timestamp

## Features implemented

-   Create notification
-   List notifications
-   Unread count
-   Mark one notification as read
-   Mark all notifications as read
-   Notification dropdown in the navigation bar

## Events that can generate notifications

Examples include:

-   New user registration
-   New researcher profile
-   New publication
-   New conference
-   New collaboration

### Why notifications were implemented

Without notifications, users have to repeatedly check each module for
changes.

Notifications create a lightweight communication layer across the
platform.

------------------------------------------------------------------------

# Authentication and Security Implementation

Security was treated as a cross-cutting requirement rather than a
feature isolated to the login page.

## Password hashing

The project uses:

``` python
CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)
```

When a user registers, the password is passed through:

``` python
hash_password(password)
```

The stored value is the bcrypt hash, not the original password.

During login:

``` python
verify_password(
    plain_password,
    hashed_password
)
```

is used to verify the credentials.

### Why hashing is necessary

If the database were compromised, storing plaintext passwords would
expose every account immediately.

Password hashing creates a one-way representation suitable for
credential verification.

------------------------------------------------------------------------

## JWT authentication

After successful login, an access token is created.

The token contains:

-   `sub` → user email
-   `id` → user ID
-   `role` → user role
-   `exp` → expiration time

The implementation uses:

``` text
Algorithm: HS256
Token lifetime: 30 minutes
```

### Why JWT was used

JWT provides a compact token that can be sent with API requests without
storing a server-side session for every request.

------------------------------------------------------------------------

## OAuth2 bearer scheme

The API uses:

``` python
OAuth2PasswordBearer(tokenUrl="/users/login")
```

Protected endpoints receive:

``` text
Authorization: Bearer <token>
```

The token is decoded and verified before protected operations are
executed.

------------------------------------------------------------------------

## Token verification

The security layer validates:

1.  Token signature
2.  Token expiration
3.  User identity
4.  Role information

Invalid or expired tokens return:

``` text
401 Unauthorized
```

------------------------------------------------------------------------

# Role-Based Access Control

RBAC is one of the major security features of SCNA.

## Roles

The project specification defines:

-   Researcher
-   Institution Admin
-   Reviewer
-   System Admin

The implemented permission matrix also uses an `Admin` role for
administrative operations.

## Backend enforcement

The backend uses a reusable dependency:

``` python
require_role(...)
```

Example:

``` python
Depends(
    require_role(
        "Admin",
        "System Admin",
        "Institution Admin"
    )
)
```

This means the route itself declares who can perform the operation.

## Example permission strategy

### Researchers

Create/Edit:

-   Admin
-   System Admin
-   Institution Admin

Delete:

-   Admin
-   System Admin

### Institutions

Create/Edit:

-   Admin
-   System Admin

Delete:

-   System Admin

### Publications

Create/Edit:

-   Admin
-   System Admin
-   Institution Admin

Delete:

-   Admin
-   System Admin

### Conferences

Create/Edit:

-   Admin
-   System Admin
-   Institution Admin

Delete:

-   Admin
-   System Admin

### Collaborations

Create/Edit:

-   Admin
-   System Admin

Delete:

-   System Admin

### Audit Logs

View:

-   System Admin only

------------------------------------------------------------------------

## Frontend permission gating

The frontend contains a matching permission matrix.

Elements can be marked with:

``` html
data-requires="module:action"
```

The UI hides controls that the current role cannot use.

However, the frontend is **not treated as the security boundary**.

The backend still checks permissions and returns `403 Forbidden` when a
user attempts an unauthorized operation.

### Why both frontend and backend checks were implemented

Frontend checks improve usability by hiding actions the user cannot
perform.

Backend checks provide actual security because a user can bypass
frontend code and call an API directly.

------------------------------------------------------------------------

# Dashboard and Analytics

The analytics layer uses database aggregation instead of downloading
every record to the browser.

For example, publication statistics are grouped using SQL aggregation.

This allows the backend to return data shaped for charts:

``` json
{
  "labels": ["2023", "2024", "2025"],
  "data": [12, 19, 27]
}
```

This approach reduces unnecessary client-side processing.

## Implemented analytics

### Publication analytics

-   Publications by year
-   Publications by status
-   Total publications
-   Total citations
-   Publications by type

### Researcher analytics

-   Researchers by institution
-   Researchers by department
-   Profile completion
-   Publication count
-   Citation count
-   Active project count

### Collaboration analytics

-   Total collaboration records
-   Connected researchers
-   Average authors per publication
-   Collaboration trend
-   Collaboration network

### Conference analytics

-   Total conferences
-   Upcoming
-   Ongoing
-   Completed
-   Participants
-   Presenters
-   Organizers
-   Locations
-   Participation status

------------------------------------------------------------------------

# End-to-End Workflow

``` text
1. User registers
       |
       v
2. Password is bcrypt-hashed
       |
       v
3. User account is stored
       |
       v
4. User logs in
       |
       v
5. JWT access token is generated
       |
       v
6. User accesses authorized modules
       |
       +--> Researcher Profile
       |
       +--> Publications
       |       |
       |       +--> PDF Upload
       |       +--> Authors
       |       +--> Citations
       |
       +--> Projects
       |       |
       |       +--> Researcher Assignments
       |
       +--> Conferences
       |       |
       |       +--> Participation
       |       +--> Presentations
       |
       +--> Collaborations
       |       |
       |       +--> Co-authorship
       |       +--> Network
       |
       +--> Reports
       |       |
       |       +--> Analytics
       |       +--> Charts
       |       +--> CSV
       |       +--> PDF
       |
       +--> Notifications
       |
       +--> Audit Logs
       |
       v
7. PostgreSQL stores connected records
       |
       v
8. Dashboards and reports aggregate the stored data
```

------------------------------------------------------------------------

# Reasons Behind the Major Features

## Centralized database

### Reason

Research data becomes much easier to connect and analyze when all
modules use the same relational data model.

## Separate researcher profile

### Reason

A user account represents authentication.

A researcher profile represents academic information.

Keeping these concepts separate allows authentication and research
identity to evolve independently.

## Publication author table

### Reason

A single publication can contain many researchers.

The author mapping table makes multi-author relationships explicit and
allows collaboration analytics.

## Project assignment table

### Reason

Researchers can participate in multiple projects, and projects can
contain multiple researchers.

A mapping table avoids duplicated project information.

## Conference participation table

### Reason

A conference can have many participants, and a researcher can
participate in many conferences.

The participation table captures that relationship plus
presentation-specific information.

## Citation table

### Reason

Citations are relationships between publications, so they require a
dedicated table rather than a single field inside publication.

## Audit logs

### Reason

Administrative systems require accountability and traceability.

## Notifications

### Reason

Users need to be informed when important research activities occur.

## Search, filter and pagination

### Reason

The platform is intended for organizations with potentially large
datasets. Returning every record at once would reduce usability and
increase unnecessary database and network work.

------------------------------------------------------------------------

# Database Design

The database contains the following major tables.

  Table                         Purpose
  ----------------------------- ------------------------------------------
  `users`                       Authentication and roles
  `researchers`                 Academic researcher profiles
  `institutions`                Organizations and universities
  `publications`                Research publications
  `publication_authors`         Publication-to-researcher author mapping
  `citations`                   Citation relationships
  `research_projects`           Research project records
  `project_assignments`         Project-to-researcher mapping
  `conferences`                 Conference/event records
  `conference_participations`   Researcher participation
  `collaborations`              Collaboration records
  `audit_logs`                  Activity history
  `notifications`               User/system notifications

------------------------------------------------------------------------

# API and Backend Structure

The backend follows a router-based FastAPI structure.

``` text
app/
├── main.py
└── backend/
    ├── database/
    │   └── database.py
    ├── models/
    ├── schemas/
    ├── routers/
    └── utils/
        ├── security.py
        └── permissions.py
```

The full source tree contains dedicated files for each module.

This separation provides a clear distinction between:

-   Database models
-   API schemas
-   Business endpoints
-   Authentication
-   Authorization
-   Frontend routing

------------------------------------------------------------------------

# Frontend Implementation

The frontend is organized using Jinja2 templates and shared JavaScript.

## Pages implemented

-   Home
-   Login
-   Registration
-   Dashboard
-   Researchers
-   Institutions
-   Publications
-   Conferences
-   Citations
-   Collaborations
-   Reports
-   Account
-   Audit Logs

## Shared layout

`layout.html` provides:

-   Navigation
-   Authentication state
-   Notification dropdown
-   Toast messages
-   Shared details modal
-   Bootstrap integration
-   Shared JavaScript

## Reusable frontend behavior

The JavaScript layer provides:

-   API requests
-   Authentication token handling
-   Role-based UI gating
-   Search
-   Filtering
-   Sorting
-   Pagination
-   Toast notifications
-   Modal details
-   File downloads
-   Dashboard loading
-   Chart rendering

------------------------------------------------------------------------

# Validation and Data Integrity

Validation was added to prevent invalid records from entering the
system.

## User validation

-   Email format validation
-   Duplicate email prevention

## Publication validation

-   No future publication year
-   No negative citation count
-   PDF-only file upload

## Conference validation

-   Valid date format
-   End date cannot precede start date
-   Registration deadline cannot exceed event start
-   Submission deadline cannot exceed event start
-   Duplicate conference names are rejected

## Authentication validation

-   Invalid credentials rejected
-   Invalid token rejected
-   Expired token rejected
-   Unauthorized roles rejected

------------------------------------------------------------------------

# Development Challenges and Solutions

## 1. Database schema mismatch

One of the most important challenges was keeping SQLAlchemy models
synchronized with the actual PostgreSQL schema.

Examples of schema mismatch problems included missing columns and model
fields not matching database columns.

### Impact

The application could fail during insert/update operations even when the
Python model appeared correct.

### Solution

I compared:

-   SQLAlchemy model definitions
-   Existing database columns
-   API schemas
-   SQL queries
-   Frontend payloads

and aligned the model/schema/database contract.

### Learning

A relational application has multiple layers that must agree:

``` text
Frontend Form
      ↓
API Request
      ↓
Pydantic Schema
      ↓
SQLAlchemy Model
      ↓
PostgreSQL Table
```

A mismatch anywhere in this chain can break the operation.

------------------------------------------------------------------------

# 2. Cloud database migration

The project initially used PostgreSQL locally and later moved toward a
cloud PostgreSQL/Supabase setup.

### Challenge

Environment configuration had to change without hardcoding credentials.

### Solution

Database configuration was loaded from:

``` text
app/backend/.env
```

using `python-dotenv`.

The application reads:

``` text
DATABASE_URL
```

from the environment.

### Learning

Environment configuration should be separated from application source
code.

------------------------------------------------------------------------

# 3. Password hashing compatibility

The authentication system uses Passlib with bcrypt.

### Challenge

Password hashing libraries and bcrypt versions can have compatibility
issues.

### Solution

The dependency configuration explicitly pins:

``` text
bcrypt==4.0.1
```

while using Passlib's bcrypt context.

### Learning

Security libraries should be version-controlled carefully because
dependency changes can affect authentication behavior.

------------------------------------------------------------------------

# 4. JWT authentication debugging

Token-based authentication required coordination between:

-   Login endpoint
-   JWT creation
-   JWT verification
-   OAuth2 bearer dependency
-   Frontend local storage
-   Authorization headers
-   Role extraction

### Solution

The authentication flow was separated into:

``` text
security.py
permissions.py
user.py
nav-auth.js
```

This kept token logic and role checks reusable.

------------------------------------------------------------------------

# 5. RBAC consistency

A major challenge was ensuring that the frontend and backend agreed on
permissions.

### Solution

The backend remained the source of truth using `require_role()`.

The frontend mirrored those permissions only to hide unavailable buttons
and navigation items.

### Learning

UI restrictions and security restrictions are different things.

------------------------------------------------------------------------

# 6. Collaboration data modeling

The collaboration module required careful reasoning because
collaboration can be represented at multiple levels.

A general collaboration record exists in:

``` text
collaborations
```

while actual publication-based co-author activity is represented in:

``` text
publication_authors
```

### Challenge

The dashboard needed to represent real collaboration activity rather
than merely counting unrelated records.

### Solution

The collaboration dashboard derives its core metrics from
`publication_authors`, because those rows represent actual co-author
connections created by the collaboration workflow.

### Learning

The most important part of analytics is not only the query. It is
choosing the correct source data.

------------------------------------------------------------------------

# 7. Collaboration trend data

The collaboration tables do not contain a direct creation timestamp.

### Challenge

A monthly trend cannot be calculated directly without a date field.

### Solution

The audit trail already stores timestamped collaboration activity, so
the analytics layer uses collaboration-related audit events to derive
the trend.

### Learning

An audit trail can provide useful secondary analytical information when
the primary business table intentionally remains minimal.

------------------------------------------------------------------------

# 8. PDF report export debugging

The report dashboard uses client-side PDF generation.

### Challenge

The PDF generation code had to correctly initialize the jsPDF object and
use the browser library.

A JavaScript error such as:

``` text
ReferenceError: pdf is not defined
```

can stop the entire export flow.

### Solution

The export logic was corrected so that the jsPDF instance is created
before it is used.

### Learning

Frontend export functionality involves a separate execution path from
normal API calls and must be tested independently.

------------------------------------------------------------------------

# 9. File upload handling

Publication uploads introduced a second data-storage problem.

The database stores publication metadata while the PDF is stored as a
file.

### Challenge

The application needed to validate, save and later retrieve the file
without losing the relationship to the publication.

### Solution

The upload flow:

1.  Validates the `.pdf` extension.
2.  Creates `app/uploads`.
3.  Saves the file.
4.  Stores the file name in the publication record.
5.  Provides an authenticated download endpoint.

------------------------------------------------------------------------

# 10. Circular import issues

The backend modules have cross-module responsibilities, especially
around:

-   Collaboration
-   Audit
-   Notifications
-   Models

### Challenge

Circular imports can occur when modules import each other directly.

### Solution

Shared functionality was separated into reusable helpers and imports
were organized so that routers and models did not create unnecessary
dependency cycles.

### Learning

As a project grows, architecture matters as much as individual endpoint
code.

------------------------------------------------------------------------

# 11. API rate limiting / external research data

During development, external researcher/publication lookup
experimentation encountered API request limits.

### Impact

Repeated requests could return rate-limit responses such as:

``` text
429 Too Many Requests
```

### Solution

The workflow was adjusted to avoid unnecessary repeated requests and to
rely on the application's own stored researcher/publication records for
the main platform workflow.

### Learning

External APIs are dependencies, not guaranteed sources. The core system
should remain functional without depending on an external service for
every screen.

------------------------------------------------------------------------

# 12. Git branch and remote challenges

GitHub work was one of the most practical challenges during the project.

The repository history contains multiple development branches including:

-   `master`
-   `sharnitha`
-   `sharnitha_7`
-   `sharnitha-v`

The repository configuration also contains both an `origin` remote and a
`destination` remote.

### Challenges faced

-   Working across multiple branches
-   Switching branches during active development
-   Keeping modified code synchronized
-   Remote branch differences
-   Push rejection when the remote already contained work
-   Repository history differences
-   Maintaining a working branch while integrating updates

### What I did

I used:

-   Branch creation
-   Checkout
-   Commit
-   Fetch
-   Remote tracking
-   Merge/reset workflows
-   Push troubleshooting
-   Branch synchronization

The project history includes commits such as:

``` text
feat updated changes in the report module
updated changes
final updation of SCNA project
```

### Learning

Git is not only a backup mechanism. It is part of the development
process.

A disciplined workflow is important:

``` text
Work
  ↓
git status
  ↓
Review changes
  ↓
git add
  ↓
git commit
  ↓
git fetch
  ↓
Resolve differences if required
  ↓
git push
```

------------------------------------------------------------------------

# GitHub Challenges

The project involved repository synchronization between development work
and the team repository.

## Challenge: Remote already contained work

A push can be rejected when the remote branch contains commits that are
not present locally.

### Lesson

Before forcing a push, inspect:

``` bash
git fetch
git status
git log --oneline --graph --all
```

The goal is to understand whether the local branch is behind, ahead, or
diverged.

------------------------------------------------------------------------

## Challenge: Multiple branches

Multiple branches were created while integrating work.

### Lesson

Branch names should have clear purposes, and work should be committed in
logical units.

------------------------------------------------------------------------

## Challenge: Modified code in a different folder

Development sometimes involved more than one local project folder.

### Lesson

Before replacing files or committing changes, it is important to verify:

``` bash
git status
git branch
git remote -v
```

and confirm which working directory is connected to the intended
repository.

------------------------------------------------------------------------

# Teamwork and Collaboration Experience

Working on SCNA taught me that a multi-module software project cannot be
completed effectively by treating each module as an isolated assignment.

The system contains dependencies between modules.

For example:

``` text
User
  ↓
Researcher
  ↓
Publication
  ↓
Co-author
  ↓
Collaboration
  ↓
Dashboard
  ↓
Reports
```

A change in one module can affect several other modules.

## What teamwork taught me

### 1. Divide work by responsibility

Different team members can focus on different modules while maintaining
a common database and API contract.

### 2. Communicate interface changes

When a model or endpoint changes, the frontend and other modules
depending on it must be updated.

### 3. Use meaningful commits

Commit messages make it easier to understand why a change was
introduced.

### 4. Resolve conflicts carefully

A merge conflict is not simply a text problem. It can represent two
different implementation decisions.

### 5. Integrate before the final stage

Modules should be tested together instead of waiting until the end.

### 6. Document decisions

Documentation helps the team understand why a feature exists and how it
is connected to the rest of the system.

------------------------------------------------------------------------

# What I Learned

## Technical learning

I gained practical experience with:

-   FastAPI
-   REST API design
-   SQLAlchemy
-   PostgreSQL
-   Pydantic
-   JWT
-   OAuth2 bearer authentication
-   bcrypt password hashing
-   Role-based authorization
-   Jinja2
-   JavaScript API integration
-   Chart.js
-   File uploads
-   CSV exports
-   Client-side PDF generation
-   Relational database design
-   Git and GitHub
-   API debugging
-   Environment configuration

## Database learning

The most important database lesson was understanding that good
application design depends on relationships.

For example:

``` text
Researcher
    |
    +----< PublicationAuthor >---- Publication
    |
    +----< ProjectAssignment >---- ResearchProject
    |
    +----< ConferenceParticipation >---- Conference
```

This is more scalable than storing everything inside one large
researcher record.

## Security learning

I learned that authentication and authorization are separate:

``` text
Authentication
= Who are you?

Authorization
= What are you allowed to do?
```

SCNA implements both.

## Debugging learning

Debugging became a process rather than trial-and-error:

``` text
Observe error
    ↓
Identify failing layer
    ↓
Check request/response
    ↓
Check schema/model
    ↓
Check database
    ↓
Fix root cause
    ↓
Retest complete workflow
```

------------------------------------------------------------------------

# Testing and Verification

Testing focused on verifying both successful and failure cases.

## Authentication tests

-   Valid registration
-   Duplicate email
-   Valid login
-   Invalid password
-   Unknown user
-   Expired/invalid token
-   Unauthorized role

## Researcher tests

-   Create
-   List
-   Search
-   Sort
-   Update
-   Delete
-   Profile statistics

## Publication tests

-   Create
-   Upload PDF
-   Reject non-PDF
-   Reject future year
-   Reject negative citations
-   Search
-   Filter
-   Download
-   Update
-   Delete

## Conference tests

-   Create
-   Duplicate name rejection
-   Date validation
-   Search
-   Status filtering
-   Participation
-   Presentation details

## Collaboration tests

-   Add co-author
-   Dashboard metrics
-   Recent activity
-   Network generation
-   Pagination

## Reporting tests

-   Dashboard metrics
-   Chart data
-   CSV download
-   PDF generation
-   Authenticated downloads

## Security tests

-   Frontend permission gating
-   Backend role enforcement
-   System Admin-only audit access

------------------------------------------------------------------------

# Project Structure

``` text
SCNA/
│
├── app/
│   ├── main.py
│   │
│   ├── backend/
│   │   ├── database/
│   │   │   └── database.py
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   └── utils/
│   │
│   └── frontend/
│       ├── static/
│       │   ├── css/
│       │   ├── js/
│       │   ├── icons/
│       │   └── media/
│       └── templates/
│
├── assets/
├── doc/
├── requirements.txt
├── README.md
└── .gitignore
```

------------------------------------------------------------------------

# Running the Project

## 1. Create the environment

``` bash
python -m venv venv
```

Activate it according to the operating system.

## 2. Install dependencies

``` bash
pip install -r requirements.txt
```

## 3. Configure environment variables

Create:

``` text
app/backend/.env
```

and provide:

``` env
DATABASE_URL=your_postgresql_connection_string
SECRET_KEY=your_secret_key
```

The application loads environment variables through `python-dotenv`.

## 4. Start the application

From the project root:

``` bash
python -m uvicorn app.main:app --reload
```

## 5. API documentation

FastAPI documentation is available at:

``` text
/docs
```

------------------------------------------------------------------------

# Future Improvements

The current architecture provides a strong base for future improvements.

Possible next steps include:

-   Alembic migration management
-   More granular permission policies
-   Stronger password policy enforcement
-   Password reset workflow
-   Refresh-token support
-   Cloud object storage for publication PDFs
-   More advanced citation analytics
-   More detailed collaboration graph visualization
-   Institution-to-institution collaboration mapping
-   Background processing for large reports
-   Automated testing with Pytest
-   Docker Compose deployment
-   CI/CD workflow through GitHub Actions
-   Centralized application logging
-   Database indexing optimization
-   Advanced pagination/count APIs
-   More detailed researcher metrics

These improvements can be added without redesigning the entire
application because the current project already separates models,
schemas, routers, security utilities and frontend components.

------------------------------------------------------------------------

# Final Project Workflow

The complete system can be understood as five connected layers:

## Layer 1 --- Identity

``` text
Registration
   ↓
Password Hashing
   ↓
Login
   ↓
JWT
```

## Layer 2 --- Research Data

``` text
Researchers
   ↓
Publications
   ↓
Projects
   ↓
Conferences
   ↓
Citations
```

## Layer 3 --- Relationships

``` text
Co-authorship
Project Assignments
Conference Participation
Citations
Institutional Associations
```

## Layer 4 --- Governance

``` text
RBAC
Audit Logs
Notifications
Validation
```

## Layer 5 --- Insights

``` text
Dashboards
Analytics
Reports
Charts
Exports
```

Together these layers transform SCNA from a simple CRUD application into
a connected research management platform.

------------------------------------------------------------------------

# Conclusion

The Scientific Collaboration Network Analyzer combines research data
management, relational modeling, authentication, authorization,
collaboration tracking, conference management, citation tracking,
analytics, reporting and auditability in one platform.

The most important aspect of the project is the way the modules connect.

A researcher is not only a profile.

A publication is not only a document.

A conference is not only an event.

A project is not only a record.

Each entity contributes to a larger research ecosystem.

By connecting these entities through a relational database and exposing
them through FastAPI APIs, SCNA can track how researchers work, publish,
collaborate, participate in projects and conferences, and contribute to
an institution's overall research activity.

The project also provided practical experience in:

-   full-stack development
-   relational database design
-   authentication
-   security
-   RBAC
-   API development
-   analytics
-   debugging
-   Git/GitHub collaboration
-   documentation
-   integration of multiple software modules

SCNA therefore represents both a working research management platform
and a practical software engineering project built around real-world
data relationships, access control, maintainability and collaboration.


