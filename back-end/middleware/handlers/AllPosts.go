package handlers

import (
	dbFunc "back-end/middleware/dbFunc"
	structures "back-end/middleware/struct"
	"encoding/json"
	"net/http"
)

func HandlerInfoPostsAndUser(w http.ResponseWriter, r *http.Request) {

	db := dbFunc.Open_db()

	var data structures.Data

	data.Posts = dbFunc.SelectAllPosts_db(db)
	data.Users = dbFunc.SelectAllUsers_db(db)

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
