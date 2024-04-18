package dbFunc

import (
	structures "back-end/middleware/struct"
	"database/sql"
	"fmt"
	"log"
)

// Ouvre la db et vous permet par la suite de la manipuler
func Open_db() *sql.DB {
	db, err := sql.Open("sqlite3", "db/social-network.db")
	if err != nil {
		fmt.Println("Erreur lors de l'ouverture de la base de données :", err)
		return db
	}

	if err := db.Ping(); err != nil {
		fmt.Println("Erreur lors de la vérification du chemin de la base de données :", err)
		return db
	}

	fmt.Println("c'est bon")

	return db
}

// SelectAllsSameValues_db sélectionne les valeurs similaires dans la colonne choisie dans la base de données (db).
func SelectAllsSameValuesUsers_db(db *sql.DB, column, value string) []string {
	var result []string
	query := "SELECT " + column + " FROM Users WHERE " + column + " = ?"

	rows, err := db.Query(query, value)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	for rows.Next() {
		var val string
		if err := rows.Scan(&val); err != nil {
			log.Fatal(err)
		}
		result = append(result, val)
	}
	if err := rows.Err(); err != nil {
		log.Fatal(err)
	}

	return result
}

// Sélèctionne tout les posts de la db et return dans la structure Posts
func SelectAllPosts_db(db *sql.DB) []structures.Posts {
	var result []structures.Posts

	//p. représente les collones de Posts tandis u. sont les collones de Users
	query := "SELECT p.ID, p.Titre, p.Content, u.Nickname AS Author, p.Date, p.Image FROM Posts p JOIN Users u ON p.Author = u.ID"

	rows, err := db.Query(query)
	if err != nil {
		return result
	}
	defer rows.Close()

	for rows.Next() {
		var post structures.Posts
		if err := rows.Scan(&post.ID, &post.Titre, &post.Content, &post.Author, &post.Date, &post.Image); err != nil {
			return result
		}
		result = append(result, post)
	}
	if err := rows.Err(); err != nil {
		return result
	}

	return result
}
