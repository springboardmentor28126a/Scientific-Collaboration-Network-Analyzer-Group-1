# Backend Implementation

## Introduction

This document records the implementation progress of the backend for the **Scientific Collaboration Network Analyzer**.

The backend has been developed using the following technologies:

- FastAPI
- PostgreSQL
- SQLAlchemy ORM
- Alembic (configured for future database migrations)

---

# Backend Architecture

The backend follows a layered architecture to ensure modularity and maintainability.

```
API Layer
      ↓
Service Layer
      ↓
Database Layer (SQLAlchemy ORM)
      ↓
PostgreSQL
```

---

# Alembic Configuration

## Purpose

Alembic has been configured as the database migration tool for the project.

## Current Status

- Alembic initialized successfully.
- Connected with SQLAlchemy models.
- Configured to use the PostgreSQL database.
- Ready for generating and managing future database migrations.

## Notes

During Milestone 1, the database tables were created directly from the SQLAlchemy models. Alembic has been configured and will be used for schema versioning and future database changes in subsequent milestones.

---

# Model 1: User

## Purpose

Stores authentication and authorization information for all users of the application.

## Implemented Fields

| Field | Description |
|--------|-------------|
| id | Primary Key |
| username | Unique username |
| email | Unique email address |
| password_hash | Encrypted password |
| role | User role |
| is_active | Active account status |
| created_at | Account creation timestamp |
| updated_at | Last modification timestamp |

## Notes

- Passwords are stored as secure hashes.
- Username and email are unique.
- Timestamp fields are automatically managed.

---

# Model 2: Institution

## Purpose

Stores information about research institutions participating in the collaboration network.

## Implemented Fields

| Field | Description |
|--------|-------------|
| id | Primary Key |
| institution_name | Institution name |
| email | Official email |
| phone | Contact number |
| website | Official website |
| address | Institution address |
| city | City |
| state | State |
| country | Country |
| created_at | Record creation timestamp |
| updated_at | Last update timestamp |

---

# Model 3: Department

## Purpose

Stores departments belonging to research institutions.

## Implemented Fields

| Field | Description |
|--------|-------------|
| id | Primary Key |
| institution_id | References Institution |
| department_name | Department name |
| description | Department description |
| created_at | Record creation timestamp |
| updated_at | Last update timestamp |

## Relationships

- One Institution can have multiple Departments.
- Each Department belongs to one Institution.

---

# Model 4: Researcher

## Purpose

Stores detailed profile information of researchers.

## Implemented Fields

| Field | Description |
|--------|-------------|
| id | Primary Key |
| user_id | References User |
| institution_id | References Institution |
| department_id | References Department |
| first_name | Researcher's first name |
| last_name | Researcher's last name |
| designation | Academic designation |
| qualification | Highest qualification |
| research_interests | Areas of research |
| skills | Technical skills |
| biography | Research profile |
| profile_image | Profile image path |
| created_at | Record creation timestamp |
| updated_at | Last update timestamp |

## Relationships

- Each Researcher belongs to one User.
- Each Researcher belongs to one Institution.
- Each Researcher belongs to one Department.

---

# Password Hashing

## Purpose

Passwords are never stored in plain text.

The application uses the **Passlib** library with the **bcrypt** hashing algorithm to securely hash user passwords before storing them in the database.

## Files Added

- `app/core/security.py`
- `app/test_security.py`

## Functions Implemented

- `hash_password()`
- `verify_password()`

## Library Used

- `passlib[bcrypt]`

---

# JWT Authentication

## Purpose

Implements secure user authentication using JSON Web Tokens (JWT).

After successful login, the application generates a signed access token containing user information and an expiration time.

## Library Used

- `python-jose[cryptography]`

## Function Implemented

- `create_access_token()`

## Features

- Configurable token expiration
- Secure token signing using Secret Key
- JWT-based authentication

---

# User Registration Module

## Endpoint

```
POST /users/register
```

## Purpose

Registers a new user in the system.

## Workflow

1. Accept user details.
2. Hash the password.
3. Store user information in PostgreSQL.
4. Return the created user details.

## Files Added

- `app/api/user.py`
- `app/services/user_service.py`
- `app/schemas/user.py`

---

# Authentication Module

## Endpoint

```
POST /auth/login
```

## Purpose

Authenticates registered users using JWT.

## Workflow

1. Accept username and password.
2. Verify password using bcrypt.
3. Generate JWT access token.
4. Return access token.

## Files Added

- `app/api/auth.py`
- `app/services/auth_service.py`
- `app/schemas/auth.py`

---

# Institution Management

## Endpoint

```
POST /institutions
```

## Purpose

Creates a new institution in the database.

## Files Added

- `app/api/institution.py`
- `app/services/institution_service.py`
- `app/schemas/institution.py`

## Database Table

- `institutions`

---

# Department Management

## Endpoint

```
POST /departments
```

## Purpose

Creates a department under an existing institution.

## Files Added

- `app/api/department.py`
- `app/services/department_service.py`
- `app/schemas/department.py`

## Database Table

- `departments`

---

# Researcher Profile Management

## Endpoint

```
POST /researchers
```

## Purpose

Creates a researcher profile associated with an existing User, Institution, and Department.

## Files Added

- `app/api/researcher.py`
- `app/services/researcher_service.py`
- `app/schemas/researcher.py`

## Database Table

- `researchers`

---

# Backend Testing

The implemented backend modules were successfully tested using **Swagger UI** and verified using **PostgreSQL (pgAdmin 4)**.

## Successfully Tested Modules

- User Registration
- User Authentication (Login)
- Password Hashing
- JWT Token Generation
- Institution Creation
- Department Creation
- Researcher Profile Creation

## Verification

- API responses were validated using Swagger UI.
- Database records were verified in PostgreSQL.
- Foreign key relationships were successfully maintained.
- Authentication and password hashing worked as expected.

---

# Milestone 1 Progress Summary

The following backend components have been completed successfully:

- Requirement Gathering
- Database Schema Design
- FastAPI Project Setup
- PostgreSQL Integration
- SQLAlchemy ORM Configuration
- Alembic Configuration
- User Authentication
- Password Hashing
- JWT Authentication
- User Registration
- Institution Management
- Department Management
- Researcher Profile Management
- API Testing using Swagger
- Database Verification using PostgreSQL

---

# Conclusion

The backend foundation for the **Scientific Collaboration Network Analyzer** has been successfully implemented.

The application now supports secure user authentication, researcher profile management, institution and department management, and PostgreSQL database integration. All implemented APIs have been tested successfully through Swagger UI, and the generated records have been verified within PostgreSQL.

This implementation serves as the completed backend foundation for **Milestone 1** and provides a scalable architecture for implementing Publication Management, Collaboration Management, Conference Management, Citation Management, Reporting, and Dashboard modules in subsequent milestones.