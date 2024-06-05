package handlers

import (
	"back-end/middleware/dbFunc"
	structures "back-end/middleware/struct"
	"encoding/json"
	"net/http"
)

func HandlerProfil(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type") // Autoriser l'en-tête Content-Type
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodPost {
		token := r.FormValue("token")
		db := dbFunc.Open_db()
		user := dbFunc.SelectUserByToken(db, token)
		var data structures.Data
		data.Users = append(data.Users, user)

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
}
