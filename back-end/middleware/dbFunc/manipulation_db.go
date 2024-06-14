package dbFunc

import (
	structures "back-end/middleware/struct"
	"database/sql"
	"fmt"
	"log"
	"sort"
	"time"

	"github.com/form3tech-oss/jwt-go"
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

func FollowedUsers(db *sql.DB, user structures.User) []structures.User {
	// Requête SQL pour sélectionner les utilisateurs suivis en joignant la table Follow et Users
	querySub := `
        SELECT u.Nickname, u.ID, u.Age, u.ImageName
        FROM Follow f
        JOIN Users u ON f.UserID_Following = u.ID
        WHERE f.UserID_Follower = ?`
	var followedUsers []structures.User
	// Exécuter la requête SQL
	rows, err := db.Query(querySub, user.ID)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()
	// Parcourir les résultats
	for rows.Next() {
		var userFollowed structures.User
		if err := rows.Scan(&userFollowed.Nickname, &userFollowed.ID, &userFollowed.Age, &userFollowed.ImageName); err != nil {
			log.Fatal(err)
		}
		followedUsers = append(followedUsers, userFollowed)
	}
	// Vérifier s'il y a des erreurs après avoir parcouru les résultats
	if err := rows.Err(); err != nil {
		log.Fatal(err)
	}
	return followedUsers
}

func SelectSubscribers(db *sql.DB, user structures.User) []structures.User {
	// Requête SQL pour sélectionner les abonnés en joignant la table Follow et Users
	querySub := `
        SELECT u.Nickname, u.ID, u.Age, u.ImageName
        FROM Follow f
        JOIN Users u ON f.UserID_Follower = u.ID
        WHERE f.UserID_Following = ?`
	var userSubscribers []structures.User
	uniqueUsers := make(map[int]bool) // Utiliser une carte pour vérifier les identifiants uniques
	// Exécuter la requête SQL
	rows, err := db.Query(querySub, user.ID)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()
	// Parcourir les résultats
	for rows.Next() {
		var userSub structures.User
		if err := rows.Scan(&userSub.Nickname, &userSub.ID, &userSub.Age, &userSub.ImageName); err != nil {
			log.Fatal(err)
		}
		if !uniqueUsers[userSub.ID] {
			userSubscribers = append(userSubscribers, userSub)
			uniqueUsers[userSub.ID] = true
		}
	}
	// Vérifier s'il y a des erreurs après avoir parcouru les résultats
	if err := rows.Err(); err != nil {
		log.Fatal(err)
	}
	return userSubscribers
}

// Supprime un abonnement dans la base de données
func RemoveFollow(db *sql.DB, followerID int, followingID int) error {
	_, err := db.Exec("DELETE FROM Follow WHERE UserID_Follower = ? AND UserID_Following = ?", followerID, followingID)
	if err != nil {
		return fmt.Errorf("erreur lors de la suppression de l'abonnement : %v", err)
	}
	return nil
}

// Ajoute un abonnement dans la base de données
func AddFollow(db *sql.DB, followerID int, followingID int) error {
	_, err := db.Exec("INSERT INTO Follow (UserID_Follower, UserID_Following, Date) VALUES (?, ?, datetime('now'))", followerID, followingID)
	if err != nil {
		return fmt.Errorf("erreur lors de l'ajout de l'abonnement : %v", err)
	}
	return nil
}

// Vérifie si un utilisateur suit déjà un autre utilisateur
func CheckIfFollowing(db *sql.DB, followerID int, followingID int) bool {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM Follow WHERE UserID_Follower = ? AND UserID_Following = ?", followerID, followingID).Scan(&count)
	if err != nil {
		return false
	}
	return count > 0
}

func CheckUserExists_db(user string, db *sql.DB) bool {
	stmt, err := db.Prepare("SELECT Password FROM Users WHERE Nickname = ? OR Email = ?")
	if err != nil {
		// Gérer l'erreur
		log.Println("Erreur lors de la préparation de l'instruction SQL:", err)
		return false
	}
	defer stmt.Close()
	var hashedPassword string
	err = stmt.QueryRow(user, user).Scan(&hashedPassword)
	if err != nil {
		if err == sql.ErrNoRows {
			// L'utilisateur n'existe pas
			return false
		}
		// Gérer l'erreur
		log.Println("Erreur lors de l'exécution de la requête SQL:", err)
		return false
	}
	return true
}

// SelectAllsSameValues_db sélectionne les valeurs similaires dans la colonne choisie dans .
func SelectAllsSameValuesUsers_db(db *sql.DB, column, value string) []string {
	var result []string
	query := "SELECT " + column + " FROM Users WHERE " + value + " = ?"

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
	stmt, err := db.Prepare("INSERT INTO Posts(Titre, Content, Author, Date, Image, Type) VALUES (?, ?, ?, ?, ?, ?)")
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de la préparation de l'instruction SQL for pushInPosts :", err)
		return
	}
	defer stmt.Close()

	// Obtenir l'ID de référence de l'auteur du post
	authorID := SelectIdReferenceUser_db(post.Author.Nickname, db)

	// Exécuter la requête SQL pour insérer le nouveau post
	_, err = stmt.Exec(post.Titre, post.Content, authorID, post.Date, post.ImageName, post.Type)
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de l'exécution de l'instruction SQL for pushInPosts :", err)
		return
	} else {
		if post.Type == "Private++" {
			pushInPrivateViewers(db, post)
		}
	}

	// Le post a été inséré avec succès
	fmt.Println("Le post a été inséré avec succès.")
}

func pushInPrivateViewers(db *sql.DB, post structures.Post) {
	stmt, err := db.Prepare("INSERT INTO PrivatesViewers (Post, Author, Date, Type, Viewer) VALUES (?,?,?,?,?)")
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de la préparation de l'instruction SQL for pushInPosts :", err)
		return
	}
	defer stmt.Close()

	// Exécuter la requête SQL pour insérer le nouveau post
	for i := 0; i < len(post.PrivateViewers); i++ {
		_, err = stmt.Exec(SelectIdReferencePost_db(post.Titre, db), post.Author.ID, post.Date, post.Type, post.PrivateViewers[i].ID)
		if err != nil {
			// Gérer l'erreur
			fmt.Println("Erreur lors de l'exécution de l'instruction SQL for pushInPosts :", err)
			return
		}
	}
}

// Selectionne les privatesViewers d'un post private++ donné
func SelectPrivateViewers(db *sql.DB, post structures.Post) []structures.PrivatesViewer {
	var privatesViewers []structures.PrivatesViewer

	query := "SELECT Post, Viewer, Author FROM PrivatesViewers WHERE Post = ?"
	rows, err := db.Query(query, post.ID)
	if err != nil {
		log.Printf("Erreur lors de l'exécution de la requête SQL : %v", err)
		return privatesViewers
	}
	defer rows.Close()

	for rows.Next() {
		var privatesViewer structures.PrivatesViewer
		if err := rows.Scan(&privatesViewer.Post, &privatesViewer.Viewer, &privatesViewer.Author); err != nil {
			log.Printf("Erreur lors de la lecture des résultats : %v", err)
			continue
		}
		privatesViewers = append(privatesViewers, privatesViewer)
	}

	if err := rows.Err(); err != nil {
		log.Printf("Erreur lors de l'itération des résultats : %v", err)
	}

	return privatesViewers
}

// Fonction pour sélectionner les utilisateurs d'un événement privé
func SelectPrivatesEvent(db *sql.DB, event structures.Post) []structures.PrivatesViewer {
	var privatesViewers []structures.PrivatesViewer

	query := "SELECT Event, User, Author, Follow, NoFollow FROM PrivatesEvents WHERE Event = ?"
	rows, err := db.Query(query, event.ID)
	if err != nil {
		log.Printf("Erreur lors de l'exécution de la requête SQL : %v", err)
		return privatesViewers
	}
	defer rows.Close()

	for rows.Next() {
		var privatesViewer structures.PrivatesViewer
		if err := rows.Scan(&privatesViewer.Post, &privatesViewer.Viewer, &privatesViewer.Author, &privatesViewer.Follow, &privatesViewer.NoFollow); err != nil {
			log.Printf("Erreur lors de la lecture des résultats : %v", err)
			continue
		}
		privatesViewers = append(privatesViewers, privatesViewer)
	}

	// Vérification des erreurs après la lecture des lignes
	if err := rows.Err(); err != nil {
		log.Printf("Erreur lors de l'itération des résultats : %v", err)
	}

	return privatesViewers
}

func PushUser_db(user structures.User, db *sql.DB) {
	// Préparer la requête SQL pour insérer un nouvel utilisateur
	stmt, err := db.Prepare("INSERT INTO users (nickname, firstname, lastname, birthday, imagename, aboutme, email, password, profil) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de la préparation de l'instruction SQL pour PushUser :", err)
		return
	}
	defer stmt.Close()
	// Exécuter la requête SQL pour insérer le nouvel utilisateur
	_, err = stmt.Exec(user.Nickname, user.FirstName, user.LastName, user.Birthday, user.ImageName, user.AboutMe, user.Email, user.Password, "public")
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de l'exécution de l'instruction SQL pour PushUser :", err)
		return
	}
	// L'utilisateur a été inséré avec succès
	fmt.Println("L'utilisateur a été inséré avec succès.")
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

func SelectUserByID_db(id int, db *sql.DB) structures.User {
	var user structures.User
	// Préparer la requête SQL avec une clause WHERE pour vérifier le pseudo ou l'email
	stmt, err := db.Prepare("SELECT ID, Nickname, Password, FirstName, LastName, Birthday, Age, ImageName, AboutMe FROM Users WHERE ID = ?")
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de la préparation de l'instruction SQL for selectID :", err)
		return user
	}
	defer stmt.Close()

	// Exécuter la requête SQL avec le pseudo ou l'email fourni
	err = stmt.QueryRow(id).Scan(&user.ID, &user.Nickname, &user.Password, &user.FirstName, &user.LastName, &user.Birthday, &user.Age, &user.ImageName, &user.AboutMe)
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de l'exécution de la requête SQL for selectID :", err)
		return user
	}

	return user
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

func SelectIdReferenceEvent_db(tittle string, db *sql.DB) int {
	// Préparer la requête SQL avec une clause WHERE pour vérifier le pseudo ou l'email
	stmt, err := db.Prepare("SELECT ID FROM Events WHERE Titre = ?")
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
	stmt, err := db.Prepare("SELECT ID, Nickname, Birthday, Age, ImageName, Profil, AboutMe FROM Users")
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
		if err := rows.Scan(&user.ID, &user.Nickname, &user.Birthday, &user.Age, &user.ImageName, &user.Profil, &user.AboutMe); err != nil {
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
	query := "SELECT p.ID, p.Titre, p.Content, u.Nickname AS AuthorNickname, p.Date, p.Image, u.ImageName AS AuthorImageName, u.ID AS AuthorID, p.Type, p.EventDate, p.Followers, p.NoFollowers FROM Events p JOIN Users u ON p.Author = u.ID"

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
		if err := rows.Scan(&post.ID, &post.Titre, &post.Content, &post.Author.Nickname, &post.Date, &post.ImageName, &post.Author.ImageName, &post.Author.ID, &post.Type, &post.EventDate, &followers, &noFollowers); err != nil {
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
	stmt, err := db.Prepare("INSERT INTO Events(Titre, Content, Author, Date, Image, Type, EventDate, Followers, NoFollowers) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de la préparation de l'instruction SQL for pushInPosts :", err)
		return
	}
	defer stmt.Close()

	// Obtenir l'ID de référence de l'auteur du post
	authorID := SelectIdReferenceUser_db(event.Author.Nickname, db)

	// Exécuter la requête SQL pour insérer le nouveau post
	_, err = stmt.Exec(event.Titre, event.Content, authorID, event.Date, event.ImageName, event.Type, event.EventDate, "", "")
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de l'exécution de l'instruction SQL for pushInPosts :", err)
		return
	} else {
		if event.Type == "Private++" {
			pushInPrivatesEvents(db, event)
		}
	}

	// Le post a été inséré avec succès
	fmt.Println("L'event a été inséré avec succès.")
}

func pushInPrivatesEvents(db *sql.DB, event structures.Post) {
	stmt, err := db.Prepare("INSERT INTO PrivatesEvents (Event, Author, Date, Type, User) VALUES (?,?,?,?,?)")
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de la préparation de l'instruction SQL for pushInPosts :", err)
		return
	}
	defer stmt.Close()

	// Exécuter la requête SQL pour insérer le nouveau post
	for i := 0; i < len(event.PrivateViewers); i++ {
		_, err = stmt.Exec(SelectIdReferenceEvent_db(event.Titre, db), event.Author.ID, event.EventDate, event.Type, event.PrivateViewers[i].ID)
		if err != nil {
			// Gérer l'erreur
			fmt.Println("Erreur lors de l'exécution de l'instruction SQL for pushInPosts :", err)
			return
		}
	}
}

// ChangeYesOrNoEvent_db inverse la valeur de la colonne booléenne spécifiée pour un événement et un utilisateur
func ChangeYesOrNoEvent_db(db *sql.DB, column string, eventID, userID int) {
	// Valider la colonne pour prévenir les injections SQL
	if column != "Follow" && column != "NoFollow" {
		fmt.Println("Colonne invalide spécifiée.")
		return
	}

	// Préparer la requête SQL pour inverser la valeur booléenne
	query := fmt.Sprintf("UPDATE PrivatesEvents SET %s = NOT %s WHERE Event = ? AND User = ?", column, column)
	stmt, err := db.Prepare(query)
	if err != nil {
		fmt.Println("Erreur lors de la préparation de l'instruction SQL:", err)
		return
	}
	defer stmt.Close()

	// Exécuter la mise à jour
	_, err = stmt.Exec(eventID, userID)
	if err != nil {
		fmt.Println("Erreur lors de l'exécution de la mise à jour SQL:", err)
		return
	}

	fmt.Println("Mise à jour réussie pour l'événement", eventID, "et l'utilisateur", userID)
}

func SelectUserByNickname_db(db *sql.DB, nickname string) structures.User {
	var user structures.User
	// Préparer la requête SQL avec une clause WHERE pour vérifier le pseudo ou l'email
	stmt, err := db.Prepare("SELECT ID, Nickname, Password, FirstName, LastName, Birthday, Age, ImageName, AboutMe, Profil FROM Users WHERE Nickname = ? OR Email = ?")
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de la préparation de l'instruction SQL for SelectUserByNickanme_db :", err)
		return user
	}
	defer stmt.Close()

	// Exécuter la requête SQL avec le pseudo ou l'email fourni
	err = stmt.QueryRow(nickname, nickname).Scan(&user.ID, &user.Nickname, &user.Password, &user.FirstName, &user.LastName, &user.Birthday, &user.Age, &user.ImageName, &user.AboutMe, &user.Profil)
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de l'exécution de la requête SQL for SelectUserByNickanme_db :", err)
		return user
	}

	user.UrlImage = "http://localhost:8000/images/" + user.ImageName

	return user
}

func SelectEventByTitle_db(db *sql.DB, titre string) structures.Post {
	var event structures.Post

	// Préparer la requête SQL avec une clause WHERE pour vérifier le pseudo ou l'email
	stmt, err := db.Prepare("SELECT ID, Titre, Content, Author, Date, Image, Type, EventDate FROM Events WHERE Titre = ?")
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de la préparation de l'instruction SQL for SelectEventByTitle_db :", err)
		return event
	}
	defer stmt.Close()

	err = stmt.QueryRow(titre).Scan(&event.ID, &event.Titre, &event.Content, &event.Author.Nickname, &event.Date, &event.ImageName, &event.Type, &event.EventDate)
	if err != nil {
		// Gérer l'erreur
		fmt.Println("Erreur lors de l'exécution de la requête SQL for SelectEventByTitle_db :", err)
		return event
	}

	fmt.Println(event)

	return event
}

// Renvoie un boolean qui vérifie si l'user existe et que son mot de passe l'est aussi
func UserExist_db(db *sql.DB, user string, password string) bool {
	stmt, err := db.Prepare("SELECT Password FROM Users WHERE Nickname = ? OR Email = ?")
	if err != nil {
		// Gérer l'erreur
		log.Println("Erreur lors de la préparation de l'instruction SQL:", err)
		return false
	}
	defer stmt.Close()

	var hashedPassword string
	err = stmt.QueryRow(user, user).Scan(&hashedPassword)
	if err != nil {
		if err == sql.ErrNoRows {
			// L'utilisateur n'existe pas
			return false
		}
		// Gérer l'erreur
		log.Println("Erreur lors de l'exécution de la requête SQL:", err)
		return false
	}

	if password == hashedPassword {
		return true
	} else {
		return false
	}
}

var jwtKey = []byte("your_secret_key")

type Claims struct {
	UserID int    `json:"user_id"`
	Email  string `json:"email"`
	jwt.StandardClaims
}

// Vérifie les informations de connexion de l'utilisateur et stocke le token JWT dans la colonne uuid
func CheckUserCredentials(db *sql.DB, emailOrNickname, password string) (bool, string, error) {
	var userID int
	var storedPassword string
	query := `SELECT ID, Password FROM Users WHERE Email = ? OR Nickname = ?`
	err := db.QueryRow(query, emailOrNickname, emailOrNickname).Scan(&userID, &storedPassword)
	if err != nil {
		if err == sql.ErrNoRows {
			fmt.Println("Aucun utilisateur trouvé avec l'email ou le pseudo fourni")
			return false, "", nil
		}
		fmt.Println("Erreur lors de la vérification des informations de connexion :", err)
		return false, "", err
	}
	fmt.Printf("Mot de passe récupéré de la base de données pour l'utilisateur %s: %s\n", emailOrNickname, storedPassword)
	if storedPassword != password {
		fmt.Println("Le mot de passe ne correspond pas")
		return false, "", nil
	}
	// Générer le token JWT avec l'ID utilisateur, l'email, et un horodatage unique
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID: userID,
		Email:  emailOrNickname,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
			IssuedAt:  time.Now().Unix(), // Ajouter un horodatage unique
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		fmt.Println("Erreur lors de la génération du token :", err)
		return false, "", err
	}
	fmt.Printf("Token généré pour l'utilisateur %s: %s\n", emailOrNickname, tokenString)
	// Stocker le token dans la colonne uuid
	updateQuery := `UPDATE Users SET uuid = ? WHERE ID = ?`
	_, err = db.Exec(updateQuery, tokenString, userID)
	if err != nil {
		fmt.Println("Erreur lors de la mise à jour du token dans la base de données :", err)
		return false, "", err
	}
	fmt.Printf("Token mis à jour dans la base de données pour l'utilisateur %s\n", emailOrNickname)
	return true, tokenString, nil
}

func SelectUserByToken(db *sql.DB, token string) structures.User {

	var user structures.User
	err := db.QueryRow("SELECT * FROM Users WHERE UUID = ?", token).Scan(&user.ID, &user.Nickname, &user.Email, &user.Password, &user.FirstName, &user.LastName, &user.Birthday, &user.Age, &user.ImageName, &user.AboutMe, &user.UUID, &user.Profil)
	if err != nil {
		fmt.Println("SelectUserByToken:", err)
		return user
	}

	user.UrlImage = "http://localhost:8000/images/" + user.ImageName

	return user
}

func SelectUUID(db *sql.DB, userNickname string) string {
	var uUID string
	err := db.QueryRow("SELECT UUID FROM Users WHERE Nickname = ?", userNickname).Scan(&uUID)
	if err != nil {
		fmt.Println("erreur selectUUID:", err)
	}
	return uUID
}

func SelectAllChats(db *sql.DB, userID int) []structures.Message {
	var allMessages []structures.Message

	query := `
		SELECT c.ID, u1.Nickname AS Author, u2.Nickname AS Recipient, c.Message, c.Date, c.See
		FROM ChatsUsers c
		JOIN Users u1 ON c.Author = u1.ID
		JOIN Users u2 ON c.Recipient = u2.ID
		WHERE c.Author = ? OR c.Recipient = ?
	`

	rows, err := db.Query(query, userID, userID)
	if err != nil {
		fmt.Println("erreur lors de l'exécution de la requête (SelectAllChats):", err)
		return allMessages
	}
	defer rows.Close()

	for rows.Next() {
		var message structures.Message
		err := rows.Scan(&message.ID, &message.Author, &message.Recipient, &message.Content, &message.Date, &message.See)
		if err != nil {
			fmt.Println("erreur lors de la lecture des résultats(SelectAllChats):", err)
			continue
		}
		allMessages = append(allMessages, message)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("erreur lors de l'itération des résultats(SelectAllChats):", err)
	}

	return allMessages
}

func PushNewMessage_db(db *sql.DB, message structures.Request, userID, recipientID int) {
	query := "INSERT INTO ChatsUsers (Author, Recipient, Date, Message) VALUES (?, ?, ?, ?)"
	_, err := db.Exec(query, userID, recipientID, message.Date, message.Message)
	if err != nil {
		fmt.Println("error PushNewMessage_db:", err)
	}
}

func SelectAuthorNotSee(db *sql.DB, userID int) []string {
	var allMessages []string

	query := `
		SELECT u1.Nickname AS Author
		FROM ChatsUsers c
		JOIN Users u1 ON c.Author = u1.ID
		JOIN Users u2 ON c.Recipient = u2.ID
		WHERE c.Recipient = ? AND c.See = ?
	`

	rows, err := db.Query(query, userID, false)
	if err != nil {
		fmt.Println("erreur lors de l'exécution de la requête (SelectAuthorNotSee):", err)
		return allMessages
	}
	defer rows.Close()

	for rows.Next() {
		var author string
		err := rows.Scan(&author)
		if err != nil {
			fmt.Println("erreur lors de la lecture des résultats (SelectAuthorNotSee):", err)
			continue
		}
		allMessages = append(allMessages, author)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("erreur lors de l'itération des résultats (SelectAuthorNotSee):", err)
	}

	return allMessages
}
