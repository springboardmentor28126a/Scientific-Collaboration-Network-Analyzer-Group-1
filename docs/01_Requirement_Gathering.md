# Requirement Gathering

# Scientific Collaboration Network Analyzer

---

# 1. Introduction

The Scientific Collaboration Network Analyzer is a centralized research collaboration management platform designed to help universities, research institutions, and academic organizations efficiently manage researchers, publications, conferences, projects, citations, and institutional collaborations.

The system provides role-based access control, publication management, collaboration tracking, reporting dashboards, and research analytics through a centralized database. The platform improves transparency, simplifies research administration, and enables institutions to efficiently monitor research activities.

---

# 2. Problem Statement

Research organizations often maintain researcher profiles, publications, conferences, and collaborations across multiple disconnected systems, spreadsheets, and manual records. This fragmented approach makes it difficult to monitor research productivity, track collaborations, generate institutional reports, and manage publication records efficiently.

The objective of this project is to develop a centralized research collaboration management platform that integrates researcher information, publications, collaborations, conferences, projects, citations, and institutional partnerships into a single system.

---

# 3. Objectives

The project aims to:

- Develop a centralized research collaboration management system.
- Manage researcher profiles and institutional affiliations.
- Store and maintain publication records.
- Track collaborations among researchers.
- Manage conferences and research projects.
- Maintain citation and reference information.
- Generate dashboards and analytical reports.
- Export reports in PDF and Excel formats.
- Deploy the application using Docker.

---

# 4. Scope of the Project

The system covers the following functionalities:

- User authentication and authorization.
- Researcher profile management.
- Institution and department management.
- Publication repository management.
- Conference management.
- Research project management.
- Collaboration tracking.
- Citation and reference management.
- Reporting and analytics.
- Audit logging.

The system does not include AI-based recommendation or prediction features.

---

# 5. Stakeholders

The stakeholders involved in the system are:

- Researchers
- Institution Administrators
- Reviewers
- System Administrators
- Universities
- Research Organizations

---

# 6. User Roles

## Researcher

Responsible for:

- Maintaining personal profile
- Uploading publications
- Participating in projects
- Viewing collaborations
- Registering for conferences

---

## Institution Administrator

Responsible for:

- Managing researchers
- Managing departments
- Managing institution information
- Monitoring research activities
- Generating reports

---

## Reviewer

Responsible for:

- Reviewing submitted publications
- Verifying publication details
- Monitoring publication status

---

## System Administrator

Responsible for:

- User management
- Role management
- System configuration
- Audit logs
- Overall platform administration

---

# 7. Functional Requirements

The system shall provide the following functionalities.

## User Management

- User Registration
- User Login
- Password Management
- JWT Authentication
- Role-based Authorization

---

## Researcher Management

- Create Researcher Profile
- Update Profile
- Department Management
- Research Interests
- Skills Management
- Affiliations

---

## Institution Management

- Institution Registration
- Department Management
- Institution Details
- Institution Reports

---

## Publication Management

- Upload Publications
- Edit Publications
- Delete Publications
- Publication Status Tracking
- Publication Search
- Publication Categories

---

## Collaboration Management

- Create Collaborations
- Manage Co-authors
- Assign Researchers
- Research Teams
- Institutional Collaborations

---

## Conference Management

- Conference Registration
- Conference Scheduling
- Presentation Records
- Participation History

---

## Citation Module

- Citation Records
- Reference Lists
- DOI Management
- Publication Linking

---

## Dashboard

Researcher Dashboard

- Publications
- Projects
- Conferences
- Collaborators

Institution Dashboard

- Departments
- Publications
- Active Projects
- Collaboration Statistics

Admin Dashboard

- User Statistics
- Institution Analytics
- Overall Reports

---

## Reports

Generate

- Publication Reports
- Collaboration Reports
- Institution Reports
- Research Reports

Export

- PDF
- Excel

---

## Audit Module

Maintain logs for

- User Activities
- Publication History
- Project History
- Security Logs

---

# 8. Non-Functional Requirements

## Security

- JWT Authentication
- Password Hashing
- Role-based Authorization
- Secure API Access

---

## Performance

- Fast API Response
- Efficient Database Queries
- Concurrent User Support

---

## Reliability

- Consistent Data Storage
- Database Backup Support
- Error Handling

---

## Scalability

The application should support future expansion by adding:

- New Institutions
- More Researchers
- Additional Modules

without major architectural changes.

---

## Maintainability

The project should follow a modular architecture with proper separation of concerns.

---

## Portability

The application should be deployable using Docker.

---

# 9. Assumptions

- Every researcher belongs to at least one institution.
- Every publication has at least one author.
- A researcher may contribute to multiple publications.
- Publications may have multiple authors.
- Every conference belongs to an institution.
- Every project has at least one researcher.

---

# 10. Constraints

- Python-based backend.
- PostgreSQL database.
- FastAPI framework.
- Docker deployment.
- JWT authentication.
- Internet connection required for deployment.

---

# 11. Deliverables

The final project shall include:

- Backend APIs
- Database
- Authentication Module
- Researcher Management
- Publication Management
- Conference Management
- Collaboration Module
- Citation Module
- Reporting Dashboard
- Docker Deployment
- Project Documentation

---

# 12. Expected Outcomes

The completed system will enable research organizations to:

- Efficiently manage researchers.
- Maintain publication repositories.
- Track collaborations.
- Monitor research productivity.
- Generate institutional reports.
- Improve research management through a centralized platform.

---

# Conclusion

The Scientific Collaboration Network Analyzer is intended to serve as a comprehensive research collaboration management platform that centralizes researcher information, publications, collaborations, conferences, citations, and institutional data. The requirement gathering phase establishes the functional and non-functional requirements that will guide the design, implementation, testing, and deployment of the system.