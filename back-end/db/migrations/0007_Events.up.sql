CREATE TABLE IF NOT EXISTS Events (
    ID INTEGER PRIMARY KEY,
    Titre TEXT,
    Content TEXT,
    Author INTEGER,
    Date TEXT,
    Image TEXT,
    Type TEXT,
    PrivateViewers TEXT,
    EventDate TEXT,
    FOREIGN KEY (Author) REFERENCES Users(ID)
);