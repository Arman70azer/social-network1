CREATE TABLE IF NOT EXISTS ChatsUsers (
    ID INTEGER PRIMARY KEY,
    Author INTEGER,
    Recipient INTEGER,
    Message TEXT,
    Date TEXT,
    Groupe BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (Author) REFERENCES Users(ID),
    FOREIGN KEY (Recipient) REFERENCES Users(ID)
);