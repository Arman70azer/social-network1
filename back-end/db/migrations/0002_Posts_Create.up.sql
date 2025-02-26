CREATE TABLE IF NOT EXISTS Posts (
    ID INTEGER PRIMARY KEY,
    Titre TEXT,
    Content TEXT,
    Author INTEGER,
    Date TEXT,
    Image TEXT,
    Type TEXT,
    PrivateViewers TEXT,
    FOREIGN KEY (Author) REFERENCES Users(ID)
);