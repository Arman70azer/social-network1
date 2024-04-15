package handlers

import (
	"back-end/structures"
	"fmt"
	"net/http"
)

func HandlerRegister(w http.ResponseWriter, r *http.Request) {

	if r.Method == "POST" {
		fmt.Println("Le formulaire a été soumis avec succès")
		email := r.FormValue("email")
		fmt.Println("Voici l'adresse e-mail fournie : ", email)
	}

	var data structures.Data

	data.Requete = "ds"

	ExecuteHtmlWithData(w, "register", data)
}
