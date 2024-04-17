package middleware

import (
	"database/sql"
	"fmt"
	"log"
)

func Open_db() *sql.DB {
	db, err := sql.Open("sqlite3", "./db/social-network.db")
	if err != nil {
		log.Fatal("Erreur lors de l'ouverture de la base de données :", err)
	}
	defer db.Close()

	return db
}

// SelectAllsSameValues_db sélectionne les valeurs similaires dans la colonne choisie dans la base de données (db).
func SelectAllsSameValues_db(db *sql.DB, column, value string) []string {
	var result []string
	query := fmt.Sprintf("SELECT %s FROM Users WHERE %s = ?", column, column)

	rows, err := db.Query(query, value)
	if err != nil {
		return nil
	}
	defer rows.Close()

	for rows.Next() {
		var val string
		if err := rows.Scan(&val); err != nil {
			return nil
		}
		result = append(result, val)
	}
	if err := rows.Err(); err != nil {
		return nil
	}

	return result
}
