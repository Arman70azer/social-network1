package handlers

import (
	dbFunc "back-end/middleware/dbFunc"
	structures "back-end/middleware/struct"
	"database/sql"
	"encoding/json"
	"net/http"
	"time"
)

func HandlerInfoPostsAndUser(w http.ResponseWriter, r *http.Request) {
	// Autoriser les requêtes CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type") // Autoriser l'en-tête Content-Type
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "POST" {
		if r.FormValue("nature") == "comment" {
			var commentary structures.Commentary
			commentary.Post.Titre = r.FormValue("post")
			commentary.Author.Nickname = r.FormValue("author")
			commentary.Content = r.FormValue("content")
			commentary.Date = time.Now().Format("02/01/2006 15:04:05")

			var request structures.Request
			if verifieNewComment(commentary) {
				request.Origin = "home"
				request.Nature = "NewComment"
				request.User = commentary.Author.Nickname
				request.Post = commentary.Post.Titre
				request.ObjetcOfRequest = commentary.Content
				request.Accept = true
				request.Date = commentary.Date
				BroadcastMessageToAllClients(request)
			} else {
				request.Origin = "home"
				request.Nature = "NewComment"
				request.User = commentary.Author.Nickname
				request.Post = commentary.Post.Titre
				request.ObjetcOfRequest = commentary.Content
				request.Accept = false
				request.Date = commentary.Date
				BroadcastMessageOneClient(request)
			}
		}

	}

	db := dbFunc.Open_db()

	var data structures.Data

	posts := dbFunc.SelectAllPosts_db(db)

	data.Posts = commentToPost(posts, db)
	data.Users = dbFunc.SelectAllUsers_db(db)

	// Convertissez les données en JSON
	jsonData, err := json.Marshal(data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Définissez le type de contenu de la réponse comme JSON
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	// Renvoyez les données JSON en réponse
	w.Write(jsonData)
}

// Sert à vérifier si toutes les données sont bonnes avant de push dans la db
func verifieNewComment(commentary structures.Commentary) bool {
	db := dbFunc.Open_db()

	posts := dbFunc.SelectAllPosts_db(db)
	users := dbFunc.SelectAllUsers_db(db)

	postsBool := false
	usersBool := false

	for i := 0; i < len(posts); i++ {
		if commentary.Post.Titre == posts[i].Titre {
			postsBool = true
			break
		}
	}

	for i := 0; i < len(users); i++ {
		if commentary.Author.Nickname == users[i].Nickname {
			usersBool = true
			break
		}
	}

	if usersBool && postsBool && commentary.Content != "" {
		dbFunc.PushCommentary_db(commentary, db)
		return true
	}

	return false
}

// Rajoute les commentaires aux posts
func commentToPost(posts []structures.Post, db *sql.DB) []structures.Post {
	comments := dbFunc.SelectAllCommentary(db)

	for i := 0; i < len(comments); i++ {
		for a := 0; a < len(posts); a++ {
			if comments[i].Post.Titre == posts[a].Titre {
				posts[a].Commentaries = append(posts[a].Commentaries, comments[i])
				break
			}
		}
	}

	return posts
}
