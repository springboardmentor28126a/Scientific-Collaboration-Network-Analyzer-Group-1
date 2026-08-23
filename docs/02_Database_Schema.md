# Database Schema Design

## Introduction

The database schema defines the structure of the Scientific Collaboration Network Analyzer. It specifies all database entities, their attributes, relationships, primary keys, foreign keys, and constraints required to support the application's functionality. The schema serves as the blueprint for implementing the PostgreSQL database using SQLAlchemy ORM and Alembic migrations.

---

# Step 1: Entity Identification

The following entities have been identified from the project requirements.

Master Tables

• User
• Researcher
• Institution
• Department
• Publication
• Project
• Conference
• Collaboration
• Citation
• AuditLog

Relationship Tables

• PublicationAuthor
• ProjectMember
• ConferenceParticipation

---

# Database Entities and Attributes

## 1. User

### Purpose

Stores authentication and authorization details for all users of the system.

| Attribute | Description |
|-----------|-------------|
| id | Unique identifier |
| username | Username for login |
| email | Registered email address |
| password_hash | Encrypted password |
| role | User role (Researcher, Institution Admin, Reviewer, System Admin) |
| is_active | Active or inactive account |
| created_at | Account creation timestamp |
| updated_at | Last updated timestamp |

---

## 2. Researcher

### Purpose

Stores detailed profile information of researchers.

| Attribute | Description |
|-----------|-------------|
| id | Unique identifier |
| user_id | Associated user account |
| institution_id | Institution of researcher |
| department_id | Department of researcher |
| first_name | First name |
| last_name | Last name |
| designation | Academic designation |
| qualification | Highest qualification |
| research_interests | Research interests |
| skills | Technical skills |
| biography | Researcher biography |
| profile_image | Profile image path |
| created_at | Creation timestamp |
| updated_at | Last updated timestamp |

---

## 3. Institution

### Purpose

Stores institution information.

| Attribute | Description |
|-----------|-------------|
| id | Unique identifier |
| institution_name | Institution name |
| email | Official email |
| phone | Contact number |
| website | Official website |
| address | Institution address |
| city | City |
| state | State |
| country | Country |
| created_at | Creation timestamp |
| updated_at | Last updated timestamp |

---

## 4. Department

### Purpose

Stores department information.

| Attribute | Description |
|-----------|-------------|
| id | Unique identifier |
| institution_id | Associated institution |
| department_name | Department name |
| description | Department description |
| created_at | Creation timestamp |
| updated_at | Last updated timestamp |

---

## 5. Publication

### Purpose

Stores publication details.

| Attribute | Description |
|-----------|-------------|
| id | Unique identifier |
| title | Publication title |
| abstract | Publication abstract |
| publication_type | Journal, Conference, Book, Patent or Technical Report |
| publication_date | Publication date |
| doi | DOI number |
| status | Draft, Submitted, Published or Archived |
| file_path | Uploaded publication file |
| created_at | Creation timestamp |
| updated_at | Last updated timestamp |

---

## 6. PublicationAuthor

### Purpose

Stores the many-to-many relationship between Publications and Researchers.

| Attribute | Description |
|-----------|-------------|
| publication_id | Associated publication |
| researcher_id | Associated researcher |

---

## 7. Project

### Purpose

Stores research project information.

| Attribute | Description |
|-----------|-------------|
| id | Unique identifier |
| project_title | Project title |
| description | Project description |
| funding_agency | Funding organization |
| start_date | Project start date |
| end_date | Project end date |
| status | Active or Completed |
| created_at | Creation timestamp |
| updated_at | Last updated timestamp |

---

## 8. ProjectMember

### Purpose

Stores the many-to-many relationship between Projects and Researchers.

| Attribute | Description |
|-----------|-------------|
| project_id | Associated project |
| researcher_id | Associated researcher |
| role | Role in the project |

---

## 9. Conference

### Purpose

Stores conference information.

| Attribute | Description |
|-----------|-------------|
| id | Unique identifier |
| conference_name | Conference name |
| organizer | Conference organizer |
| location | Conference venue |
| start_date | Start date |
| end_date | End date |
| registration_deadline | Registration deadline |
| created_at | Creation timestamp |
| updated_at | Last updated timestamp |

---

## 10. ConferenceParticipation

### Purpose

Stores the many-to-many relationship between Conferences and Researchers.

| Attribute | Description |
|-----------|-------------|
| conference_id | Associated conference |
| researcher_id | Associated researcher |
| presentation_title | Presentation title |
| participation_status | Registered, Presented or Attended |

---

## 11. Collaboration

### Purpose

Stores collaboration details between researchers.

| Attribute | Description |
|-----------|-------------|
| id | Unique identifier |
| researcher_id | Researcher |
| collaborator_id | Collaborating researcher |
| project_id | Associated project |
| collaboration_type | Internal or External |
| start_date | Collaboration start date |
| end_date | Collaboration end date |

---

## 12. Citation

### Purpose

Stores citation information related to publications.

| Attribute | Description |
|-----------|-------------|
| id | Unique identifier |
| publication_id | Associated publication |
| citation_count | Number of citations |
| citation_source | Citation source |

---

## 13. AuditLog

### Purpose

Stores user activity logs for auditing purposes.

| Attribute | Description |
|-----------|-------------|
| id | Unique identifier |
| user_id | User performing the action |
| action | Activity performed |
| module | Module affected |
| created_at | Activity timestamp |
| ip_address | User IP address |

---

# Entity Relationships

The following relationships exist within the system.

- One Institution can have many Departments.
- One Institution can have many Researchers.
- One Department can have many Researchers.
- One User has one Researcher profile.
- One Publication can have multiple Researchers through the **PublicationAuthor** junction table.
- One Researcher can author multiple Publications through the **PublicationAuthor** junction table.
- One Project can involve multiple Researchers through the **ProjectMember** junction table.
- One Researcher can participate in multiple Projects through the **ProjectMember** junction table.
- One Conference can have multiple Researchers through the **ConferenceParticipation** junction table.
- One Researcher can participate in multiple Conferences through the **ConferenceParticipation** junction table.
- One Researcher can collaborate with multiple Researchers through collaboration records.
- One collaboration record belongs to two Researchers and may optionally belong to one Project.
- One Publication can have multiple Citation records.
- One User can generate multiple AuditLog records.

---

# Primary Keys

- Every master table contains an **id** column as its Primary Key.
- Junction tables (**PublicationAuthor**, **ProjectMember**, and **ConferenceParticipation**) use **Composite Primary Keys** consisting of their associated foreign keys.

---

# Foreign Keys

The following foreign key relationships exist within the database.

- Researcher.user_id → User.id
- Researcher.institution_id → Institution.id
- Researcher.department_id → Department.id
- Department.institution_id → Institution.id
- PublicationAuthor.publication_id → Publication.id
- PublicationAuthor.researcher_id → Researcher.id
- ProjectMember.project_id → Project.id
- ProjectMember.researcher_id → Researcher.id
- ConferenceParticipation.conference_id → Conference.id
- ConferenceParticipation.researcher_id → Researcher.id
- Collaboration.researcher_id → Researcher.id
- Collaboration.collaborator_id → Researcher.id
- Collaboration.project_id → Project.id
- Citation.publication_id → Publication.id
- AuditLog.user_id → User.id

---

# Database Normalization

The database schema follows normalization principles to minimize redundancy and improve data consistency.

- First Normal Form (1NF)
- Second Normal Form (2NF)
- Third Normal Form (3NF)

Each entity is stored independently, and relationships are established using foreign keys and junction tables where necessary.

---

# Expected Database Modules

The database supports the following application modules.

- User Management
- Researcher Management
- Institution Management
- Publication Management
- Conference Management
- Collaboration Management
- Citation Management
- Dashboard
- Reports
- Audit Module

---

# Final Database Tables

1. User
2. Researcher
3. Institution
4. Department
5. Publication
6. PublicationAuthor
7. Project
8. ProjectMember
9. Conference
10. ConferenceParticipation
11. Collaboration
12. Citation
13. AuditLog

---

# Conclusion

The database schema provides a normalized, scalable, and maintainable structure for managing researchers, institutions, publications, publication-author mappings, research projects, project memberships, conferences, conference participation, collaborations, citations, and audit logs. It forms the foundation for implementing the backend using PostgreSQL, SQLAlchemy, Alembic, and FastAPI.