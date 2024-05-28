package handlers

import (
	"fmt"
	"html/template"
	"net/http"
)

func HandlerLogin(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("../social-network/front-end/htmls/page_login.html")
	if err != nil {
		fmt.Println("Error loading template:", err)
		http.Error(w, "Erreur lors du chargement du modèle", http.StatusInternalServerError)
		return
	}
	err = tmpl.Execute(w, r)
	if err != nil {
		fmt.Println("Error executing template:", err)
		http.Error(w, "Erreur lors de l'exécution du modèle", http.StatusInternalServerError)
		return
	}
}
