package handlers

import (
	"fmt"
	"html/template"
	"net/http"

	structures "back-end/structures"
)

// Permet de charger la page html avec les données voulu(w, nom de la page, data (info user, post et etc....))
func ExecuteHtmlWithData(w http.ResponseWriter, page string, data structures.Data) {
	tmpl, err := template.ParseFiles("../front-end/htmls/page_" + page + ".html")
	if err != nil {
		fmt.Println("Error loading template:", err)
		http.Error(w, "Erreur lors du chargement du modèle", http.StatusInternalServerError)
		return
	}
	err = tmpl.Execute(w, data)
	if err != nil {
		fmt.Println("Error executing template:", err)
		http.Error(w, "Erreur lors de l'exécution du modèle", http.StatusInternalServerError)
		return
	}
}
