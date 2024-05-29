package handlers

import (
	"back-end/middleware/dbFunc"
	"fmt"
	"net/http"
)

func HandlerLogin(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type") // Autoriser l'en-tête Content-Type
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "POST" {
		user := r.FormValue("user")
		password := r.FormValue("password")

		db := dbFunc.Open_db()

		if dbFunc.UserExist_db(db, user, password) {
			fmt.Println("valid")
		} else {
			fmt.Println("nop")
		}

		w.WriteHeader(http.StatusOK)
	}
}
