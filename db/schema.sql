CREATE DATABASE dreams_app;

\c dreams_app

CREATE TABLE dreams (
    id SERIAL PRIMARY KEY,
    image_url TEXT,
    inputText TEXT,
    story_order INTEGER,
    book_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES dream_books (id) ON DELETE CASCADE
);



CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE,
    password_digest TEXT
);


CREATE TABLE dream_books (
    id SERIAL PRIMARY KEY,
    title TEXT,
    date TEXT
);

