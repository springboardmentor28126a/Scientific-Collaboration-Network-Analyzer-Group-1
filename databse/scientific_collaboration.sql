-- Scientific Collaboration Network Analyzer Database

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(255)
);

CREATE TABLE researchers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    department VARCHAR(100),
    institution VARCHAR(100),
    research_area VARCHAR(100)
);

CREATE TABLE publications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    author VARCHAR(100),
    journal VARCHAR(100),
    year INTEGER,
    status VARCHAR(50)
);

CREATE TABLE conferences (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    location VARCHAR(100),
    date DATE
);

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    funding VARCHAR(100)
);

CREATE TABLE collaborations (
    id SERIAL PRIMARY KEY,
    researcher1 INTEGER,
    researcher2 INTEGER,
    project INTEGER
);

CREATE TABLE institutions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    address TEXT
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    publication_id INTEGER,
    reviewer VARCHAR(100),
    decision VARCHAR(50),
    comments TEXT,
    score INTEGER
);