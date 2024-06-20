CREATE TABLE IF NOT EXISTS Users (
    ID INTEGER PRIMARY KEY,
    Nickname TEXT,
    Email TEXT,
    Password TEXT,
    FirstName TEXT,
    LastName TEXT,
    Birthday TEXT,
    Age INTEGER,
    ImageName TEXT,
    AboutMe TEXT,
    UUID TEXT NOT NULL DEFAULT "",
    Profil TEXT
);
