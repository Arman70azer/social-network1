package handlers

import (
	"back-end/middleware"
	"back-end/middleware/dbFunc"
	structures "back-end/middleware/struct"
	"database/sql"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

func CreationPost(w http.ResponseWriter, r *http.Request) {
	// Autoriser les requêtes CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type") // Autoriser l'en-tête Content-Type
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "POST" {
		content := r.FormValue("content")
		typePost := r.FormValue("type")
		author := dbFunc.SelectUserByToken(dbFunc.Open_db(), r.FormValue("user"))
		nature := r.FormValue("nature")
		titleEvent := r.FormValue("title")

		var privateUsers []structures.User
		if typePost == "Private++" {
			privateViewers := r.Form["users"]
			for i := 0; i < len(privateViewers); i++ {
				privateUser := dbFunc.SelectUserByNickname_db(dbFunc.Open_db(), privateViewers[i])

				privateUsers = append(privateUsers, privateUser)
			}
			privateUsers = append(privateUsers, author)
			fmt.Println(privateViewers)
		}
		var fileName string

		// Récupérer le fichier image
		file, handler, err := r.FormFile("file")
		if err != nil {
			fileName = "nothing"
		} else {
			defer file.Close()
			// Stocker le fichier sur le serveur
			fileName = handler.Filename
			_, err1 := os.Stat(`./db/images/` + fileName)

			if os.IsNotExist(err1) {
				out, err := os.Create("./db/images/" + fileName)
				if err != nil {
					http.Error(w, "Erreur lors de la création du fichier sur le serveur", http.StatusInternalServerError)
					fmt.Println("1 erreur lors de la création du fichier pour le post de " + author.Nickname)
					return
				}
				defer out.Close()

				_, err = io.Copy(out, file)
				if err != nil {
					http.Error(w, "Erreur lors de la copie du fichier sur le serveur", http.StatusInternalServerError)
					fmt.Println("2 erreur lors de la création du fichier pour le post de " + author.Nickname)
					return
				}
			}

		}

		dbOpen := dbFunc.Open_db()

		// Obtenir la date actuelle
		currentDate := time.Now()
		formatDate := currentDate.Format("02/01/2006 15:04:05")

		post := structures.Post{
			Content:        content,
			Type:           typePost,
			ImageName:      fileName,
			Author:         author,
			PrivateViewers: privateUsers,
			Date:           formatDate,
		}

		if post.Content != "" && middleware.RegexSpaceAndScript(post.Content) {
			if postNotExist(post, dbOpen) && nature == "Post" {
				post.Titre = author.Nickname + "-" + formatDate
				dbFunc.PushInPosts_db(post, dbOpen)
				var request structures.Request
				request.Accept = true
				request.Post = post.Titre
				request.User = post.Author.Nickname
				request.Date = formatDate
				request.Nature = "New-post"
				Broadcast(request)
			} else if nature == "Event" && eventNotExist(post, dbOpen) && titleEvent != "" && middleware.RegexSpaceAndScript(titleEvent) {
				post.EventDate = conversionEventDate(r.FormValue("eventDate"))
				post.Titre = titleEvent
				if post.EventDate != "conversion impossible" {
					dbFunc.PushInEvents_db(post, dbOpen)
					var request structures.Request
					request.Accept = true
					request.Post = titleEvent
					request.User = post.Author.Nickname
					request.Date = formatDate
					request.Nature = "New-event"
					Broadcast(request)
				}
			}
		} else {
			fmt.Println("Un post ou un event n'est pas autoriser")
		}

		// Répondre avec un message de succès
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Données du post reçues avec succès"))
		return
	}
}

// Empeche l'user de poster deux fois le même post
func postNotExist(post structures.Post, db *sql.DB) bool {
	postOfdb := dbFunc.SelectAllPosts_db(db)

	for i := 0; i < len(postOfdb); i++ {
		if postOfdb[i].Titre == post.Titre && postOfdb[i].Author.ID == post.Author.ID {
			return false
		}
		if postOfdb[i].Content == post.Content && postOfdb[i].Author.ID == post.Author.ID {
			return false
		}
	}

	return true
}

func eventNotExist(event structures.Post, db *sql.DB) bool {
	eventDb := dbFunc.SelectAllEvents_db(db)

	for i := 0; i < len(eventDb); i++ {
		if eventDb[i].Titre == event.Titre && eventDb[i].Author.ID == event.Author.ID {
			return false
		}
		if eventDb[i].Content == event.Content && eventDb[i].Author.ID == event.Author.ID {
			return false
		}
	}

	return true
}

func conversionEventDate(date string) string {
	layout := "2006-01-02T15:04"

	eventDate, err := time.Parse(layout, date)
	if err != nil {
		return "conversion impossible"
	}

	formattedDate := eventDate.Format("02/01/2006 15:04")

	return formattedDate

}
