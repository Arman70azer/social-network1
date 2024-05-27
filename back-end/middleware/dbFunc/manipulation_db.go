package dbFunc

import (
	structures "back-end/middleware/struct"
	"database/sql"
	"fmt"
	"log"
	"sort"
	"strings"
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
	query := "SELECT p.ID, p.Titre, p.Content, u.Nickname AS AuthorNickname, p.Date, p.Image, u.ImageName AS AuthorImageName, u.ID AS AuthorID, p.Type FROM Posts p JOIN Users u ON p.Author = u.ID"

	rows, err := db.Query(query)
	if err != nil {
		log.Println("Erreur lors de la requête:", err)
		return result
	}
	defer rows.Close()

	for rows.Next() {
		var post structures.Post
		if err := rows.Scan(&post.ID, &post.Titre, &post.Content, &post.Author.Nickname, &post.Date, &post.ImageName, &post.Author.ImageName, &post.Author.ID, &post.Type); err != nil {
			log.Println("Erreur lors du scan des lignes:", err)
			continue // Continuer à la prochaine ligne en cas d'erreur de scan
		}
		post.UrlImage = "http://localhost:8000/images/" + post.ImageName
		post.Author.UrlImage = "http://localhost:8000/images/" + post.Author.ImageName

		if post.ImageName == "nothing" {
			post.ImageName = ""
		}
		result = append(result, post)
	}
	if err := rows.Err(); err != nil {
		log.Println("Erreur lors du parcours des lignes:", err)
	}

	//On trie les posts avants de les envoyers par rapport à leur date de parutions
	sort.Slice(result, func(i, j int) bool {
		// Convertir les dates en objets time.Time pour pouvoir les comparer
		dateI, _ := time.Parse("02/01/2006 15:04:05", result[i].Date)
		dateJ, _ := time.Parse("02/01/2006 15:04:05", result[j].Date)
		return dateI.After(dateJ)
	})

	return result
}

func PushInPosts_db(post structures.Post, db *sql.DB) {
	// Préparer la requête SQL pour insérer un nouveau post
	stmt, err := db.Prepare("INSERT INTO Posts(Titre, Content, Author, Date, Image, Type, PrivateViewers) VALUES (?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de la préparation de l'instruction SQL for pushInPosts :", err)
		return
	}
	defer stmt.Close()

	// Obtenir l'ID de référence de l'auteur du post
	authorID := SelectIdReferenceUser_db(post.Author.Nickname, db)

	allPrivateviewers := ""

	for i := 0; i < len(post.PrivateViewers); i++ {
		if allPrivateviewers != "" {
			allPrivateviewers = allPrivateviewers + "-" + post.PrivateViewers[i].Nickname
		} else {
			allPrivateviewers = allPrivateviewers + post.PrivateViewers[i].Nickname
		}
	}

	// Exécuter la requête SQL pour insérer le nouveau post
	_, err = stmt.Exec(post.Titre, post.Content, authorID, post.Date, post.ImageName, post.Type, allPrivateviewers)
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

func SelectIdReferencePost_db(tittle string, db *sql.DB) int {
	// Préparer la requête SQL avec une clause WHERE pour vérifier le pseudo ou l'email
	stmt, err := db.Prepare("SELECT ID FROM Posts WHERE Titre = ?")
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de la préparation de l'instruction SQL for selectID :", err)
		return 0
	}
	defer stmt.Close()

	// Exécuter la requête SQL avec le pseudo ou l'email fourni
	var id int
	err = stmt.QueryRow(tittle).Scan(&id)
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de l'exécution de la requête SQL for selectID :", err)
		return 0
	}

	return id
}

func SelectAllUsers_db(db *sql.DB) []structures.User {
	var users []structures.User

	// Préparer la requête SQL
	stmt, err := db.Prepare("SELECT ID, Nickname, Birthday, Age, ImageName FROM Users")
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de la préparation de l'instruction SQL for SelectAllUser :", err)
		return users
	}
	defer stmt.Close()

	// Exécuter la requête SQL pour obtenir un ensemble de résultats
	rows, err := stmt.Query()
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de l'exécution de la requête SQL :", err)
		return users
	}
	defer rows.Close()

	// Itérer sur les résultats
	for rows.Next() {
		var user structures.User
		// Scanner les valeurs dans la structure User
		if err := rows.Scan(&user.ID, &user.Nickname, &user.Birthday, &user.Age, &user.ImageName); err != nil {
			// Gérer l'erreur
			fmt.Println("Erreur lors du scan des lignes:", err)
			continue // Continuer à la prochaine ligne en cas d'erreur de scan
		}
		// Construire l'URL de l'image
		user.UrlImage = "http://localhost:8000/images/" + user.ImageName

		// Ajouter l'utilisateur à la slice users
		users = append(users, user)
	}

	// Gérer les erreurs après la boucle
	if err := rows.Err(); err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors du parcours des lignes:", err)
	}

	return users
}

func PushCommentary_db(comment structures.Commentary, db *sql.DB) {
	// Préparer la requête SQL pour insérer un nouveau post
	stmt, err := db.Prepare("INSERT INTO Commentary(Content, Author, Date, Post) VALUES (?, ?, ?, ?)")
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de la préparation de l'instruction SQL for pushInPosts :", err)
		return
	}
	defer stmt.Close()

	// Obtenir l'ID de référence de l'auteur du post
	authorID := SelectIdReferenceUser_db(comment.Author.Nickname, db)
	postID := SelectIdReferencePost_db(comment.Post.Titre, db)

	// Exécuter la requête SQL pour insérer le nouveau post
	_, err = stmt.Exec(comment.Content, authorID, comment.Date, postID)
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de l'exécution de l'instruction SQL for pushInPosts :", err)
		return
	}
}

func SelectAllCommentary(db *sql.DB) []structures.Commentary {
	var result []structures.Commentary

	// p. représente les colonnes de Posts tandis que u. représente les colonnes de Users
	query := `
	SELECT c.Content, u.Nickname AS CommentaryAuthor, p.Titre AS CommentaryPost, c.Date 
	FROM Commentary c 
	JOIN Users u ON c.Author = u.ID 
	JOIN Posts p ON c.Post = p.ID`

	rows, err := db.Query(query)
	if err != nil {
		log.Println("Erreur lors de la requête:", err)
		return result
	}
	defer rows.Close()

	for rows.Next() {
		var comment structures.Commentary
		if err := rows.Scan(&comment.Content, &comment.Author.Nickname, &comment.Post.Titre, &comment.Date); err != nil {
			log.Println("Erreur lors du scan des lignes:", err)
			continue // Continuer à la prochaine ligne en cas d'erreur de scan
		}
		result = append(result, comment)
	}
	if err := rows.Err(); err != nil {
		log.Println("Erreur lors du parcours des lignes:", err)
	}

	return result
}

func SelectAllLikeOrDislike_db(db *sql.DB) []structures.LikeOrDislike {
	var result []structures.LikeOrDislike

	query := `
	SELECT l.Type, u.Nickname AS LikeDislikeUser, p.Titre AS LikeDislikePost, l.Date
	FROM LikesDislikes l
	JOIN Users u ON l.User = u.ID
	JOIN Posts p ON l.Post = p.ID`

	rows, err := db.Query(query)
	if err != nil {
		log.Println("erreur lors de la requête (SelectAllLikeOrDislike_db):", err)
		return result
	}

	for rows.Next() {
		var likeDslike structures.LikeOrDislike

		if err := rows.Scan(&likeDslike.Type, &likeDslike.User, &likeDslike.Post, &likeDslike.Date); err != nil {
			log.Println("Erreur lors du scan des lignes:", err)
			continue // Continuer à la prochaine ligne en cas d'erreur de scan
		}
		result = append(result, likeDslike)
	}

	if err := rows.Err(); err != nil {
		log.Println("Erreur lors du parcours des lignes:", err)
	}

	return result
}

func PushLikeDislike_db(db *sql.DB, like structures.LikeOrDislike) {

	// Préparer la requête SQL pour insérer un nouveau post
	stmt, err := db.Prepare("INSERT INTO LikesDislikes(Type, Post, User, Date) VALUES (?, ?, ?, ?)")
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de la préparation de l'instruction SQL for PushLikeDislike_db :", err)
		return
	}
	defer stmt.Close()

	// Obtenir l'ID de référence de l'auteur du post
	authorID := SelectIdReferenceUser_db(like.User, db)
	postID := SelectIdReferencePost_db(like.Post, db)

	// Exécuter la requête SQL pour insérer le nouveau post
	_, err = stmt.Exec(like.Type, postID, authorID, like.Date)
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de l'exécution de l'instruction SQL for pushInPosts :", err)
		return
	}

}

func DeleteLikeDislike_db(db *sql.DB, like structures.LikeOrDislike) {

	// requête SQL pour supprimer la ligne basée sur les valeurs spécifiées
	stmt, err := db.Prepare("DELETE FROM LikesDislikes WHERE Type=? AND Post=? AND User=?")
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de la préparation de l'instruction SQL for DeleteLikeDislike_db :", err)
		return
	}
	defer stmt.Close()

	// Obtenir l'ID de référence de l'auteur du post
	authorID := SelectIdReferenceUser_db(like.User, db)
	postID := SelectIdReferencePost_db(like.Post, db)

	// Exécuter la requête SQL pour insérer le nouveau post
	_, err = stmt.Exec(like.Type, postID, authorID)
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de l'exécution de l'instruction SQL for pushInPosts :", err)
		return
	}
}

func SelectAllEvents_db(db *sql.DB) []structures.Post {
	var result []structures.Post

	// p. représente les colonnes de Posts tandis que u. représente les colonnes de Users
	query := "SELECT p.ID, p.Titre, p.Content, u.Nickname AS AuthorNickname, p.Date, p.Image, u.ImageName AS AuthorImageName, u.ID AS AuthorID, p.Type, p.EventDate, p.Followers, p.NoFollowers, p.PrivateViewers FROM Events p JOIN Users u ON p.Author = u.ID"

	rows, err := db.Query(query)
	if err != nil {
		log.Println("Erreur lors de la requête:", err)
		return result
	}
	defer rows.Close()

	for rows.Next() {
		var post structures.Post
		var followers string
		var noFollowers string
		var privateViewers string
		if err := rows.Scan(&post.ID, &post.Titre, &post.Content, &post.Author.Nickname, &post.Date, &post.ImageName, &post.Author.ImageName, &post.Author.ID, &post.Type, &post.EventDate, &followers, &noFollowers, &privateViewers); err != nil {
			log.Println("Erreur lors du scan des lignes:", err)
			continue // Continuer à la prochaine ligne en cas d'erreur de scan
		}
		post.UrlImage = "http://localhost:8000/images/" + post.ImageName
		post.Author.UrlImage = "http://localhost:8000/images/" + post.Author.ImageName

		if post.ImageName == "nothing" {
			post.ImageName = ""
		}

		layout := "02/01/2006 15:04" // Format de la date reçue

		eventDate, _ := time.Parse(layout, post.EventDate)

		if followers != "" {
			post.Followers = strings.Split(followers, " ")
		}

		if noFollowers != "" {
			post.NoFollowers = strings.Split(noFollowers, " ")
		}

		if privateViewers != "" {
			allPVOfthisEvents := strings.Split(privateViewers, " ")

			for i := 0; i < len(allPVOfthisEvents); i++ {
				user := SelectUserByNickname_db(db, allPVOfthisEvents[i])
				post.PrivateViewers = append(post.PrivateViewers, user)
			}
		}

		if time.Now().Before(eventDate) {
			result = append(result, post)
		}
	}
	if err := rows.Err(); err != nil {
		log.Println("Erreur lors du parcours des lignes:", err)
	}

	//On trie les posts avants de les envoyers par rapport à leur date de parutions
	sort.Slice(result, func(i, j int) bool {
		// Convertir les dates en objets time.Time pour pouvoir les comparer
		dateI, _ := time.Parse("02/01/2006 15:04:05", result[i].Date)
		dateJ, _ := time.Parse("02/01/2006 15:04:05", result[j].Date)
		return dateI.After(dateJ)
	})

	return result
}

func PushInEvents_db(event structures.Post, db *sql.DB) {
	// Préparer la requête SQL pour insérer un nouveau post
	stmt, err := db.Prepare("INSERT INTO Events(Titre, Content, Author, Date, Image, Type, PrivateViewers, EventDate, Followers, NoFollowers) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de la préparation de l'instruction SQL for pushInPosts :", err)
		return
	}
	defer stmt.Close()

	// Obtenir l'ID de référence de l'auteur du post
	authorID := SelectIdReferenceUser_db(event.Author.Nickname, db)

	allPrivateviewers := ""

	for i := 0; i < len(event.PrivateViewers); i++ {
		if allPrivateviewers != "" {
			allPrivateviewers = allPrivateviewers + "-" + event.PrivateViewers[i].Nickname
		} else {
			allPrivateviewers = allPrivateviewers + event.PrivateViewers[i].Nickname
		}
	}

	// Exécuter la requête SQL pour insérer le nouveau post
	_, err = stmt.Exec(event.Titre, event.Content, authorID, event.Date, event.ImageName, event.Type, allPrivateviewers, event.EventDate, "", "")
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de l'exécution de l'instruction SQL for pushInPosts :", err)
		return
	}

	// Le post a été inséré avec succès
	fmt.Println("L'event a été inséré avec succès.")
}

func AddFollow_db(db *sql.DB, eventTitle, userToAdd string) {
	// Préparer la requête SQL pour récupérer les followers actuels
	stmt, err := db.Prepare("SELECT Followers FROM Events WHERE Titre = ?")
	if err != nil {
		fmt.Println("Erreur lors de la préparation de l'instruction SQL:", err)
		return
	}
	defer stmt.Close()

	var followers string
	err = stmt.QueryRow(eventTitle).Scan(&followers)
	if err != nil {
		fmt.Println("Erreur lors de l'exécution de la requête SQL:", err)
		return
	}

	fmt.Println("récupère : ", followers)

	var splitFollow []string
	if followers != "" {
		splitFollow = strings.Split(followers, " ")
	}

	splitFollow = append(splitFollow, userToAdd)

	updatedFollowers := strings.Join(splitFollow, " ")

	// Préparer la requête SQL pour mettre à jour les followers
	stmt2, err := db.Prepare("UPDATE Events SET Followers = ? WHERE Titre = ?")
	if err != nil {
		fmt.Println("Erreur lors de la préparation de l'instruction SQL:", err)
		return
	}
	defer stmt2.Close()

	fmt.Println("update : ", updatedFollowers)

	// Exécuter la mise à jour
	_, err = stmt2.Exec(updatedFollowers, eventTitle)
	if err != nil {
		fmt.Println("Erreur lors de l'exécution de la mise à jour SQL:", err)
		return
	}

}

func DeleteFollow_db(db *sql.DB, eventTitle, userToDelete string) {
	// Préparer la requête SQL pour récupérer les followers actuels
	stmt, err := db.Prepare("SELECT Followers FROM Events WHERE Titre = ?")
	if err != nil {
		fmt.Println("Erreur lors de la préparation de l'instruction SQL:", err)
		return
	}
	defer stmt.Close()

	var followers string
	err = stmt.QueryRow(eventTitle).Scan(&followers)
	if err != nil {
		fmt.Println("Erreur lors de l'exécution de la requête SQL:", err)
		return
	}

	// Séparer les followers existants en un tableau
	arrayFollowers := strings.Split(followers, " ")

	// Créer un nouveau tableau de followers sans le follower à supprimer
	var newFollowers []string
	for _, follower := range arrayFollowers {
		if follower != userToDelete {
			newFollowers = append(newFollowers, follower)
		}
	}

	// Joindre les followers mis à jour en une seule chaîne
	updatedFollowers := strings.Join(newFollowers, " ")

	// Préparer la requête SQL pour mettre à jour les followers
	stmt2, err := db.Prepare("UPDATE Events SET Followers = ? WHERE Titre = ?")
	if err != nil {
		fmt.Println("Erreur lors de la préparation de l'instruction SQL:", err)
		return
	}
	defer stmt2.Close()

	// Exécuter la mise à jour
	_, err = stmt2.Exec(updatedFollowers, eventTitle)
	if err != nil {
		fmt.Println("Erreur lors de l'exécution de la mise à jour SQL:", err)
		return
	}

	fmt.Println("Followers mis à jour avec succès")
}

func SelectUserByNickname_db(db *sql.DB, nickname string) structures.User {
	var user structures.User
	// Préparer la requête SQL avec une clause WHERE pour vérifier le pseudo ou l'email
	stmt, err := db.Prepare("SELECT ID, Nickname, Password, FirstName, LastName, Birthday, Age, ImageName, AboutMe, Followers FROM Events WHERE Nickname = ?")
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de la préparation de l'instruction SQL for SelectUserByNickanme_db :", err)
		return user
	}
	defer stmt.Close()

	// Exécuter la requête SQL avec le pseudo ou l'email fourni
	var followers string
	err = stmt.QueryRow(nickname).Scan(&user.ID, &user.Nickname, &user.Password, &user.FirstName, &user.LastName, &user.Birthday, &user.Age, &user.ImageName, &user.AboutMe, &followers)
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de l'exécution de la requête SQL for SelectUserByNickanme_db :", err)
		return user
	}

	if followers != "" {
		user.Followers = strings.Split(followers, " ")
	}

	return user
}

func SelectEventByTitle_db(db *sql.DB, titre string) structures.Post {
	var event structures.Post

	// Préparer la requête SQL avec une clause WHERE pour vérifier le pseudo ou l'email
	stmt, err := db.Prepare("SELECT ID, Titre, Content, Author, Date, Image, Type, PrivateViewers, EventDate, Followers, NoFollowers FROM Events WHERE Titre = ?")
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de la préparation de l'instruction SQL for SelectEventByTitle_db :", err)
		return event
	}
	defer stmt.Close()

	var followers string
	var privateFollowers string
	var noFollowers string
	err = stmt.QueryRow(titre).Scan(&event.ID, &event.Titre, &event.Content, &event.Author.Nickname, &event.Date, &event.ImageName, &event.Type, &privateFollowers, &event.EventDate, &followers, &noFollowers)
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de l'exécution de la requête SQL for SelectEventByTitle_db :", err)
		return event
	}

	if followers != "" {
		event.Followers = strings.Split(followers, " ")
	}

	if noFollowers != "" {
		event.NoFollowers = strings.Split(noFollowers, " ")
	}

	if privateFollowers != "" {
		allPVfollower := strings.Split(privateFollowers, " ")

		for _, pvFollow := range allPVfollower {
			event.PrivateViewers = append(event.PrivateViewers, SelectUserByNickname_db(db, pvFollow))
		}
	}
	fmt.Println(event)

	return event
}
