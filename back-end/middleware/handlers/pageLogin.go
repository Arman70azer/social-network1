package handlers

import (
	"fmt"
	"net/http"
)

func HandlerLogin(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type") // Autoriser l'en-tête Content-Type
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "POST" {
		fmt.Println("username: ", r.FormValue("user"))
		fmt.Println("password: ", r.FormValue("password"))
		w.WriteHeader(http.StatusOK)
	}
}
