CREATE TABLE IF NOT EXISTS PrivateSub (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    RecipientID INTEGER NOT NULL,
    SenderID INTEGER NOT NULL,
    FOREIGN KEY (RecipientID) REFERENCES Users(ID),
    FOREIGN KEY (SenderID) REFERENCES Users(ID)
);