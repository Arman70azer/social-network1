package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type Post struct {
	Title    string `json:"title"`
	Content  string `json:"content"`
	TypePost string `json:"typePost"`
	Image    string `json:"file"`

	// Ajoutez d'autres champs selon vos besoins
}

func CreationPost(w http.ResponseWriter, r *http.Request) {
	// Autoriser les requêtes CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type") // Autoriser l'en-tête Content-Type
	w.Header().Set("Content-Type", "application/json")

	// Vérifier si la méthode de la requête est POST
	if r.Method == "POST" {
		// Décode le JSON reçu dans un objet Post
		var post Post
		err := json.NewDecoder(r.Body).Decode(&post)
		if err != nil {
			http.Error(w, "Erreur lors de la lecture du JSON", http.StatusBadRequest)
			return
		}

		// Utilisez les données du post comme vous le souhaitez
		fmt.Println("Titre:", post.Title)
		fmt.Println("Contenu:", post.Content)
		fmt.Println("Type de publication:", post.TypePost)
		fmt.Println("fileName:", post.Image)

		// Répondre avec un message de succès
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Données du post reçues avec succès"))
		return
	}

	fmt.Println("hhh")
}
