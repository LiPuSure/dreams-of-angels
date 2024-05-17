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

INSERT INTO dreams (image_url, inputText, story_order) VALUES ('file:///Users/tingli/seb/open-ai/images/1.webp', 'first, Jerry is a cute mouse. One day He is eating a yummy cheese because he is hungry.', 1);
INSERT INTO dreams (image_url, inputText, story_order) VALUES ('/Users/tingli/seb/open-ai/images/2.webp', 'Second, Tom who is a big cat came and decided to steal the cheese.', 2);
INSERT INTO dreams (image_url, inputText, story_order) VALUES ('/Users/tingli/seb/open-ai/images/3.webp', 'third, jerry was really angry and he ran quickly into Tom. He bit Tom and he also got hurt by running too quickly.', 3);
INSERT INTO dreams (image_url, inputText, story_order) VALUES ('/Users/tingli/seb/open-ai/images/4.webp', 'fourth, jerry then went back home and he found a band-aid at home.', 4);
INSERT INTO dreams (image_url, inputText, story_order) VALUES ('/Users/tingli/seb/open-ai/images/5.webp', 'Fifth, as the end of the story,  after jerry got a band-aid, he was much happier.', 5);
