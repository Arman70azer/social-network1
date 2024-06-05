CREATE TABLE IF NOT EXISTS PrivatesViewers (
    ID INTEGER PRIMARY KEY,
    Post INTEGER,
    Author INTEGER,
    Date TEXT,
    Type TEXT,
    Viewer INTEGER,
    FOREIGN KEY (Post) REFERENCES Posts(ID),
    FOREIGN KEY (Author) REFERENCES Users(ID),
    FOREIGN KEY (Viewer) REFERENCES Users(ID)
);