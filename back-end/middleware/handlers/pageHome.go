package handlers

import (
	dbFunc "back-end/middleware/dbFunc"
	"encoding/json"
	"net/http"
)

func HandlerHome(w http.ResponseWriter, r *http.Request) {

	db := dbFunc.Open_db()

	allPost := dbFunc.SelectAllPosts_db(db)

	// Convertissez les données en JSON
	jsonData, err := json.Marshal(allPost)
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
