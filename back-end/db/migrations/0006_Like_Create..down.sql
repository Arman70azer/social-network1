CREATE TABLE IF NOT EXISTS LikesDislikes (
    Type TEXT,
    User INTEGER,
    Post INTEGER,
    Date TEXT,
    FOREIGN KEY (User) REFERENCES Users(ID),
    FOREIGN KEY (Post) REFERENCES Posts(ID)
);