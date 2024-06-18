CREATE TABLE IF NOT EXISTS Commentary (
    Content TEXT,
    Author INTEGER,
    Post INTEGER,
    Date TEXT,
    FOREIGN KEY (Author) REFERENCES Users(ID),
    FOREIGN KEY (Post) REFERENCES Posts(ID)
);