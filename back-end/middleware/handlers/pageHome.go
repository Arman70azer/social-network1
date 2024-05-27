package handlers

import (
	"back-end/middleware"
	dbFunc "back-end/middleware/dbFunc"
	structures "back-end/middleware/struct"
	"database/sql"
	"encoding/json"
	"fmt"
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
			comment(r)
		} else if r.FormValue("nature") == "like" || r.FormValue("nature") == "dislike" {
			likeDislike(r)
		} else if r.FormValue("nature") == "yes" || r.FormValue("nature") == "no" {
			event(r)

		}
	}

	db := dbFunc.Open_db()

	var data structures.Data

	posts := dbFunc.SelectAllPosts_db(db)
	events := dbFunc.SelectAllEvents_db(db)

	data.Posts = commentAndLikeToPost(posts, db)
	data.Users = dbFunc.SelectAllUsers_db(db)
	data.Events = events

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

// Rajoute les commentaires, les likes et les dislikes aux posts
func commentAndLikeToPost(posts []structures.Post, db *sql.DB) []structures.Post {
	comments := dbFunc.SelectAllCommentary(db)
	likesDislikes := dbFunc.SelectAllLikeOrDislike_db(db)

	for i := 0; i < len(comments); i++ {
		for a := 0; a < len(posts); a++ {
			if comments[i].Post.Titre == posts[a].Titre {
				posts[a].Commentaries = append(posts[a].Commentaries, comments[i])
				break
			} else if posts[a].Commentaries == nil { //On précise qu'il n'y a rien pour éviter les erreurs en next.jsx car sinon c'est considèrer comme
				posts[a].Commentaries = []structures.Commentary{}
			}
		}
	}

	for i := 0; i < len(likesDislikes); i++ {
		for a := 0; a < len(posts); a++ {
			if likesDislikes[i].Post == posts[a].Titre {
				if likesDislikes[i].Type == "like" {
					posts[a].Likes = append(posts[a].Likes, likesDislikes[i])
					break
				} else {
					posts[a].Dislikes = append(posts[a].Dislikes, likesDislikes[i])
					break
				}
			}
		}
	}

	return posts
}

func alreadyLike(like structures.LikeOrDislike) (bool, bool) {
	db := dbFunc.Open_db()

	likes_db := dbFunc.SelectAllLikeOrDislike_db(db)

	alreadyLike := false
	otherLikeExistant := false

	for i := 0; i < len(likes_db); i++ {
		if likes_db[i].User == like.User && likes_db[i].Post == like.Post && likes_db[i].Type == like.Type {
			alreadyLike = true
			break
		} else if likes_db[i].User == like.User && likes_db[i].Post == like.Post {
			//Si il a déjà like et qu'il dislike par la suite pour l'exemple on supprime l'ancien like pour le nouvelle avis
			dbFunc.DeleteLikeDislike_db(db, likes_db[i])
			otherLikeExistant = true
		}
	}

	if !alreadyLike {
		dbFunc.PushLikeDislike_db(db, like)
		return alreadyLike, otherLikeExistant
	} else {
		dbFunc.DeleteLikeDislike_db(db, like)
		return alreadyLike, otherLikeExistant
	}
}

func likeDislike(r *http.Request) {
	var like structures.LikeOrDislike

	like.Post = r.FormValue("post")
	like.Type = r.FormValue("nature")
	like.User = r.FormValue("user")
	like.Date = time.Now().Format("02/01/2006 15:04:05")

	var request structures.Request
	request.User = like.User
	request.Post = like.Post
	request.Accept = true
	request.Origin = "home"
	request.Nature = "New-" + like.Type

	likeAlready, otherTypeLikeExist := alreadyLike(like)

	request.OtherLikeDislike = otherTypeLikeExist
	if likeAlready {
		request.ObjetcOfRequest = "remove"
		fmt.Println("like remove")
	} else {
		request.ObjetcOfRequest = "add"
		fmt.Println("like add")
	}
	BroadcastMessageToAllClients(request)
}

func comment(r *http.Request) {
	var commentary structures.Commentary
	commentary.Post.Titre = r.FormValue("post")
	commentary.Author.Nickname = r.FormValue("user")
	commentary.Content = r.FormValue("content")
	commentary.Date = time.Now().Format("02/01/2006 15:04:05")

	//Dès que le commentaire est passé dans la db
	if verifieNewComment(commentary) {
		var request structures.Request
		request.Origin = "home"
		request.Nature = "New-comment"
		request.User = commentary.Author.Nickname
		request.Post = commentary.Post.Titre
		request.ObjetcOfRequest = commentary.Content
		request.Accept = true
		request.Date = commentary.Date
		BroadcastMessageToAllClients(request)
	} else {
		fmt.Println("Error dans la func verifieNewComment dans AllPost.go")
	}
}

// Gère les requêtes concernant les events
func event(r *http.Request) {

	db := dbFunc.Open_db()

	userName := r.FormValue("user")

	titre := r.FormValue("event")

	allEvent := dbFunc.SelectAllEvents_db(db)
	allUser := dbFunc.SelectAllUsers_db(db)

	if middleware.UserRegister(userName, allUser) && middleware.EventExist(titre, allEvent) {
		eventTarget := dbFunc.SelectEventByTitle_db(db, titre)

		var column string

		switch r.FormValue("nature") {
		case "yes":
			column = "Followers"
			if middleware.Contains(userName, eventTarget.Followers) {
				dbFunc.DeleteYesOrNoEvent_db(db, column, titre, userName)
			} else {
				if middleware.Contains(userName, eventTarget.NoFollowers) {
					dbFunc.DeleteYesOrNoEvent_db(db, "NoFollowers", titre, userName)
				}
				dbFunc.AddYesOrNoEvent_db(db, column, titre, userName)
			}

		case "no":
			column = "NoFollowers"
			if middleware.Contains(userName, eventTarget.NoFollowers) {
				dbFunc.DeleteYesOrNoEvent_db(db, column, titre, userName)
			} else {
				if middleware.Contains(userName, eventTarget.Followers) {
					dbFunc.DeleteYesOrNoEvent_db(db, "Followers", titre, userName)
				}
				dbFunc.AddYesOrNoEvent_db(db, column, titre, userName)
			}

		default:
			fmt.Println("func event ----->error cause the nature of request is: ", r.FormValue("nature"))

		}
	}
}
