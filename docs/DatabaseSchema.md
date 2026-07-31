# Database Schema

## User

- id
- username
- email
- password

## Researcher

- id
- user_id
- department
- institution
- research_area

## Publication

- id
- title
- author
- journal
- year
- status

## Conference

- id
- name
- location
- date

## Project

- id
- title
- description
- funding

## Collaboration

- id
- researcher1
- researcher2
- project

## Institution

- id
- name
- address

## Review

- id
- publication_id
- reviewer
- decision
- comments
- score