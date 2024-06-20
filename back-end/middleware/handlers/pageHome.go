package handlers

import (
	"back-end/middleware"
	dbFunc "back-end/middleware/dbFunc"
	structures "back-end/middleware/struct"
	"database/sql"
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
		db := dbFunc.Open_db()
		token := r.FormValue("token")
		user := dbFunc.SelectUserByToken(db, token)

		if user.Nickname != "" {
			if r.FormValue("nature") == "comment" {
				filename := middleware.StockeImage(w, r, user)
				comment(r, user, filename, w)
			} else if r.FormValue("nature") == "like" || r.FormValue("nature") == "dislike" {
				likeDislike(w, r, user)
			} else if r.FormValue("nature") == "yes" || r.FormValue("nature") == "no" {
				event(db, r, user, w)

			} else {

				var data structures.Data

				posts := sortPrivatePlus(db, user, dbFunc.SelectAllPosts_db(db))
				events := sortPrivatePlus(db, user, dbFunc.SelectAllEvents_db(db))

				data.Posts = commentAndLikeToPost(posts, db)
				data.Users = dbFunc.SelectAllUsers_db(db)
				data.Events = events
				data.Groups = dbFunc.GetsGroups(db, user.ID)

				middleware.ReturnWithW(w, data)
			}
		} else {
			var request structures.Request
			request.Nature = "cookie"
			request.Accept = false
			middleware.ReturnWithW(w, request)
		}
	}
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

func likeDislike(w http.ResponseWriter, r *http.Request, user structures.User) {
	var like structures.LikeOrDislike

	like.Post = r.FormValue("post")
	like.Type = r.FormValue("nature")
	like.User = user.Nickname
	like.Date = time.Now().Format("02/01/2006 15:04:05")

	var request structures.Request
	request.User = user.Nickname
	request.Post = like.Post
	request.Accept = true
	request.Origin = "home"
	request.Nature = "New-" + like.Type

	likeAlready, otherTypeLikeExist := alreadyLike(like)

	request.OtherLikeDislike = otherTypeLikeExist
	if likeAlready {
		request.ObjectOfRequest = "remove"
		fmt.Println("like remove")
	} else {
		request.ObjectOfRequest = "add"
		fmt.Println("like add")
	}
	middleware.ReturnWithW(w, request)
}

func comment(r *http.Request, user structures.User, fileName string, w http.ResponseWriter) {
	var commentary structures.Commentary
	commentary.Post.Titre = r.FormValue("post")
	commentary.Author = user
	commentary.Content = r.FormValue("content")
	commentary.Date = time.Now().Format("02/01/2006 15:04:05")
	commentary.Image = fileName

	//Dès que le commentaire est passé dans la db
	if verifieNewComment(commentary) {
		var request structures.Request
		request.Origin = "home"
		request.Nature = "New-comment"
		request.User = commentary.Author.Nickname
		request.Post = commentary.Post.Titre
		request.ObjectOfRequest = commentary.Content
		request.Accept = true
		request.Date = commentary.Date
		request.Image = "http://localhost:8000/images/" + fileName
		middleware.ReturnWithW(w, request)
	} else {
		fmt.Println("Error dans la func verifieNewComment dans AllPost.go")
	}
}

// Gère les requêtes concernant les events
func event(db *sql.DB, r *http.Request, user structures.User, w http.ResponseWriter) {

	titre := r.FormValue("event")

	eventTarget := dbFunc.SelectEventByTitle_db(db, titre)
	privatesEventUsers := dbFunc.SelectPrivatesEvent(db, eventTarget)

	if eventTarget.EventDate != "" && len(privatesEventUsers) > 0 && middleware.ContainsID(user.ID, privatesEventUsers) {

		var column string

		var request structures.Request
		request.Event = titre
		request.User = user.Nickname
		request.Origin = "home"

		follow, noFollow := middleware.FollowEvent(user.ID, privatesEventUsers)

		switch r.FormValue("nature") {
		case "yes":
			column = "Follow"
			request.Nature = "New-followEvent"
			if follow {
				dbFunc.ChangeYesOrNoEvent_db(db, column, eventTarget.ID, user.ID)
				request.ObjectOfRequest = "unfollowEvent"
			} else {
				if noFollow {
					dbFunc.ChangeYesOrNoEvent_db(db, "NoFollow", eventTarget.ID, user.ID)
					fmt.Println("nofollow")
				}
				dbFunc.ChangeYesOrNoEvent_db(db, column, eventTarget.ID, user.ID)
				request.ObjectOfRequest = "followEvent"
			}

			fmt.Println(follow, noFollow)

			request.Accept = true

		case "no":
			column = "NoFollow"
			request.Nature = "New-unfollowEvent"
			if noFollow {
				dbFunc.ChangeYesOrNoEvent_db(db, column, eventTarget.ID, user.ID)
				request.ObjectOfRequest = "unfollowEvent"
			} else {
				if follow {
					dbFunc.ChangeYesOrNoEvent_db(db, "Follow", eventTarget.ID, user.ID)
				}
				dbFunc.ChangeYesOrNoEvent_db(db, column, eventTarget.ID, user.ID)
				request.ObjectOfRequest = "followEvent"
			}

			request.Accept = true

		default:
			fmt.Println("func event ----->error cause the nature of request is: ", r.FormValue("nature"))
			request.Accept = false
		}
		middleware.ReturnWithW(w, request)
	}
}

func sortPrivatePlus(db *sql.DB, user structures.User, posts []structures.Post) []structures.Post {
	var finalsPosts []structures.Post
	var postEvent bool

	if len(posts) == 0 {
		return finalsPosts
	}

	if posts[0].EventDate != "" {
		postEvent = true
	} else {
		postEvent = false
	}

	for i := 0; i < len(posts); i++ {
		var privateViewers []structures.PrivatesViewer
		if postEvent {
			privateViewers = dbFunc.SelectPrivatesEvent(db, posts[i])
		} else {
			privateViewers = dbFunc.SelectPrivateViewers(db, posts[i])
		}
		if posts[i].Type == "Private++" {
			for a := 0; a < len(privateViewers); a++ {
				if privateViewers[a].Viewer == user.ID {
					if postEvent {
						follow, noFollow := selectFollowersEvents(db, privateViewers)
						posts[i].Followers = follow
						posts[i].NoFollowers = noFollow
					} else {
						posts[i].PrivateViewers = selectUserPrivatesPost(db, privateViewers)
					}
					finalsPosts = append(finalsPosts, posts[i])
				}
			}
		} else if posts[i].Type != "Public" && posts[i].Type != "Private" {
			groups := dbFunc.GetsGroups(db, user.ID)

			if len(groups) > 0 {
				for a := 0; a < len(groups); a++ {
					if groups[a].Name == posts[i].Type {
						if postEvent {
							follow, noFollow := selectFollowersEvents(db, privateViewers)
							posts[i].Followers = follow
							posts[i].NoFollowers = noFollow
						}
						finalsPosts = append(finalsPosts, posts[i])
						break
					}
				}
			}
		} else {
			finalsPosts = append(finalsPosts, posts[i])
		}
	}
	return finalsPosts
}

func selectFollowersEvents(db *sql.DB, privatesUsers []structures.PrivatesViewer) ([]string, []string) {
	var follow []string
	var noFollow []string

	for i := 0; i < len(privatesUsers); i++ {
		if privatesUsers[i].Follow {
			follow = append(follow, dbFunc.SelectUserByID_db(privatesUsers[i].Viewer, db).Nickname)
		}
		if privatesUsers[i].NoFollow {
			noFollow = append(noFollow, dbFunc.SelectUserByID_db(privatesUsers[i].Viewer, db).Nickname)
		}

	}

	return follow, noFollow
}

func selectUserPrivatesPost(db *sql.DB, privatesViewers []structures.PrivatesViewer) []structures.User {
	var users []structures.User

	for i := 0; i < len(privatesViewers); i++ {
		user := dbFunc.SelectUserByID_db(privatesViewers[i].Viewer, db)
		users = append(users, user)
	}

	return users
}
