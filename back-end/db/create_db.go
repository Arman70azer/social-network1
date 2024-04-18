package db

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

func Create_db() {
	database, err := sql.Open("sqlite3", "db/social-network.db")
	if err != nil {
		log.Fatal("Error opening database:", err)
	}
	defer database.Close()

	tx, err := database.Begin()
	if err != nil {
		log.Fatal("Error starting transaction:", err)
	}

	createTables := []string{
		`CREATE TABLE IF NOT EXISTS Users (
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
			UUID TEXT
		);`,
		`CREATE TABLE IF NOT EXISTS Posts (
			ID INTEGER PRIMARY KEY,
			Titre TEXT,
			Content TEXT,
			Author TEXT,
			Date TEXT,
			Image TEXT
		);`,
		`CREATE TABLE IF NOT EXISTS Hashtags (
			ID INTEGER PRIMARY KEY,
			Tag TEXT
		);`,
		`CREATE TABLE IF NOT EXISTS PostHashtags (
			PostID INTEGER,
			HashtagID INTEGER,
			FOREIGN KEY (PostID) REFERENCES Posts(ID),
			FOREIGN KEY (HashtagID) REFERENCES Hashtags(ID)
		);`,
	}
	

	for _, createTableQuery := range createTables {
		_, err := tx.Exec(createTableQuery)
		if err != nil {
			log.Println("Error creating table:", err)
			if rollbackErr := tx.Rollback(); rollbackErr != nil {
				log.Fatal("Error rolling back transaction:", rollbackErr)
			}
			return
		}
	}

	err = tx.Commit()
	if err != nil {
		log.Fatal("Error committing transaction:", err)
	}
}
