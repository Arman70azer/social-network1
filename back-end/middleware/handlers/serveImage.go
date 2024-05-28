package handlers

import (
	"io"
	"net/http"
	"os"
)

func ServeImage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type") // Autoriser l'en-tête Content-Type
	w.Header().Set("Content-Type", "application/json")
	// Récupérer le nom de fichier de l'image à partir de la requête
	fileName := r.URL.Path[len("/images/"):]
	// Ouvrir le fichier d'image
	file, err := os.Open("./db/images/" + fileName)
	if err != nil {
		// Gérer l'erreur si le fichier n'existe pas
		http.NotFound(w, r)
		return
	}
	defer file.Close()
	// Copier le contenu du fichier dans le flux de réponse
	io.Copy(w, file)
}
