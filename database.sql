CREATE DATABASE userstest;

CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE racun(
    iban VARCHAR(255) PRIMARY KEY,
    user_id int REFERENCES users(user_id),
    stanje int CHECK(stanje >= 0)
);

CREATE TABLE transakcije(
    trans_id SERIAL PRIMARY KEY,
    iban_primatelj VARCHAR(255) REFERENCES racun(iban),
    iban_posiljatelj VARCHAR(255) REFERENCES racun(iban),
    suma int NOT NULL,
    datum timestamptz
);