package handlers

import (
	"back-end/middleware/dbFunc"
	structures "back-end/middleware/struct"
	"database/sql"
	"fmt"
	"io"
	"net/http"
	"os"
)

func CreationPost(w http.ResponseWriter, r *http.Request) {
	// Autoriser les requêtes CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type") // Autoriser l'en-tête Content-Type
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "POST" {

		title := r.FormValue("title")
		content := r.FormValue("content")
		typePost := r.FormValue("typePost")
		author := r.FormValue("user")
		var privateUsers []structures.User
		if typePost == "Private" {
			privateViewers := r.Form["users"]
			for i := 0; i < len(privateViewers); i++ {
				var user structures.User
				user.Nickname = privateViewers[i]
				privateUsers = append(privateUsers, user)
			}
		}
		var fileName string

		// Récupérer le fichier
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
					fmt.Println("1 erreur lors de la création du fichier pour le post de " + author)
					return
				}
				defer out.Close()

				_, err = io.Copy(out, file)
				if err != nil {
					http.Error(w, "Erreur lors de la copie du fichier sur le serveur", http.StatusInternalServerError)
					fmt.Println("2 erreur lors de la création du fichier pour le post de " + author)
					return
				}
			}

		}

		dbOpen := dbFunc.Open_db()

		// Créer un objet Post avec les données du formulaire
		var user structures.User
		user.Nickname = author
		user.ID = dbFunc.SelectIdReferenceUser_db(author, dbOpen)

		post := structures.Post{
			Titre:          title,
			Content:        content,
			Type:           typePost,
			ImageName:      fileName,
			Author:         user,
			PrivateViewers: privateUsers,
		}

		fmt.Println(post)

		if postNotExist(post, dbOpen) && post.Titre != "" && post.Content != "" {
			dbFunc.PushInPosts_db(post, dbOpen)
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
