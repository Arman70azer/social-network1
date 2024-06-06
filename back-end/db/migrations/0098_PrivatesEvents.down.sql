CREATE TABLE IF NOT EXISTS PrivatesEvents (
    ID INTEGER PRIMARY KEY,
    Event INTEGER,
    Author INTEGER,
    User INTEGER,
    Follow BOOLEAN NOT NULL DEFAULT 0,
    NoFollow BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (Event) REFERENCES Events(ID),
    FOREIGN KEY (Author) REFERENCES Users(ID),
    FOREIGN KEY (User) REFERENCES Users(ID)
);