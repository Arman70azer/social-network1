-- Table for group chat conversations
CREATE TABLE IF NOT EXISTS GroupChatConv (
    ID INTEGER PRIMARY KEY,
    GroupID INTEGER NOT NULL,
    UserID INTEGER NOT NULL,
    Content TEXT,
    Date TEXT,
    FOREIGN KEY (GroupID) REFERENCES GroupChat(ID),
    FOREIGN KEY (UserID) REFERENCES Users(ID)
);

-- Table for group chat details
CREATE TABLE IF NOT EXISTS GroupChat (
    ID INTEGER PRIMARY KEY,
    GroupName TEXT NOT NULL,
    Date TEXT
);

-- Table for group members
CREATE TABLE IF NOT EXISTS GroupMembers (
    ID INTEGER PRIMARY KEY,
    GroupID INTEGER NOT NULL,
    Member INTEGER NOT NULL,
    FOREIGN KEY (GroupID) REFERENCES GroupChat(ID),
    FOREIGN KEY (Member) REFERENCES Users(ID)
);

-- Table for tracking if a user has seen the group chat
CREATE TABLE IF NOT EXISTS GroupChatSee (
    ID INTEGER PRIMARY KEY,
    ChatID INTEGER NOT NULL,
    UserID INTEGER NOT NULL,
    Seen BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (ChatID) REFERENCES GroupChatConv(ID),
    FOREIGN KEY (UserID) REFERENCES Users(ID)
);
