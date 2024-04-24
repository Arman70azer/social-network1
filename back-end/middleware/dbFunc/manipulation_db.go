package dbFunc

import (
	structures "back-end/middleware/struct"
	"database/sql"
	"fmt"
	"log"
	"time"
)

// Ouvre la db et permet par la suite de la manipuler
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

	return db
}

// SelectAllsSameValues_db sélectionne les valeurs similaires dans la colonne choisie dans la db.
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
func SelectAllPosts_db(db *sql.DB) []structures.Post {
	var result []structures.Post

	// p. représente les colonnes de Posts tandis que u. représente les colonnes de Users
	query := "SELECT p.ID, p.Titre, p.Content, u.Nickname AS AuthorNickname, p.Date, p.Image, u.ImageName AS AuthorImageName, u.ID AS AuthorID FROM Posts p JOIN Users u ON p.Author = u.ID"

	rows, err := db.Query(query)
	if err != nil {
		log.Println("Erreur lors de la requête:", err)
		return result
	}
	defer rows.Close()

	for rows.Next() {
		var post structures.Post
		if err := rows.Scan(&post.ID, &post.Titre, &post.Content, &post.Author.Nickname, &post.Date, &post.Image, &post.Author.ImageName, &post.Author.ID); err != nil {
			log.Println("Erreur lors du scan des lignes:", err)
			continue // Continuer à la prochaine ligne en cas d'erreur de scan
		}
		result = append(result, post)
	}
	if err := rows.Err(); err != nil {
		log.Println("Erreur lors du parcours des lignes:", err)
	}

	return result
}
func PushInPosts_db(post structures.Post, db *sql.DB) {
	// Préparer la requête SQL pour insérer un nouveau post
	stmt, err := db.Prepare("INSERT INTO Posts(Titre, Content, Author, Date, Image) VALUES (?, ?, ?, ?, ?)")
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de la préparation de l'instruction SQL for pushInPosts :", err)
		return
	}
	defer stmt.Close()

	// Obtenir l'ID de référence de l'auteur du post
	authorID := SelectIdReferenceUser_db(post.Author.Nickname, db)

	// Obtenir la date actuelle
	currentDate := time.Now()
	formatDate := currentDate.Format("02/01/2006 15:04:05")

	// Exécuter la requête SQL pour insérer le nouveau post
	_, err = stmt.Exec(post.Titre, post.Content, authorID, formatDate, post.Image)
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de l'exécution de l'instruction SQL for pushInPosts :", err)
		return
	}

	// Le post a été inséré avec succès
	fmt.Println("Le post a été inséré avec succès.")
}

func SelectIdReferenceUser_db(nickOrMail string, db *sql.DB) int {
	// Préparer la requête SQL avec une clause WHERE pour vérifier le pseudo ou l'email
	stmt, err := db.Prepare("SELECT ID FROM Users WHERE Nickname = ? OR Email = ?")
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de la préparation de l'instruction SQL for selectID :", err)
		return 0
	}
	defer stmt.Close()

	// Exécuter la requête SQL avec le pseudo ou l'email fourni
	var id int
	err = stmt.QueryRow(nickOrMail, nickOrMail).Scan(&id)
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de l'exécution de la requête SQL for selectID :", err)
		return 0
	}

	return id
}
