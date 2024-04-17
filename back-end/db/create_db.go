package db

import (
	"database/sql"
	"log"
)

func Createdb() {
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
            ID INTEGER PRIMARY KEY
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
		`CREATE TABLE IF NOT EXISTS Category (
            ID INTEGER PRIMARY KEY, 
            Name VARCHAR(150)
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
