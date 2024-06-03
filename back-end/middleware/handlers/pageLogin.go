package handlers

import (
	"back-end/middleware"
	"back-end/middleware/dbFunc"
	"encoding/json"
	"fmt"
	"net/http"
)

type LoginResponse struct {
	Token   string `json:"token"`
	Message string `json:"message"`
	Success bool   `json:"success"`
}

func HandlerLogin(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type") // Autoriser l'en-tête Content-Type
	w.Header().Set("Content-Type", "application/json")
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}
	user := r.FormValue("user")
	password := r.FormValue("password")
	fmt.Println("Tentative de connexion avec l'utilisateur:", user)
	fmt.Println("Mot de passe fourni:", password)
	if middleware.RegexSpaceAndScript(user) && middleware.RegexSpaceAndScript(password) {
		db := dbFunc.Open_db()
		defer db.Close()
		valid, token, err := dbFunc.CheckUserCredentials(db, user, password)
		if err != nil {
			http.Error(w, "Erreur interne du serveur", http.StatusInternalServerError)
			fmt.Println("Erreur interne du serveur :", err)
			return
		}
		response := LoginResponse{}
		if valid {
			response = LoginResponse{
				Token:   token,
				Message: "Connexion réussie",
				Success: true,
			}
			fmt.Printf("Connexion réussie pour l'utilisateur: %s\n", user)
		} else {
			response = LoginResponse{
				Message: "Email, pseudo ou mot de passe incorrect",
				Success: false,
			}
			fmt.Printf("Échec de la connexion pour l'utilisateur: %s\n", user)
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(response)
	} else {
		http.Error(w, "Données invalides", http.StatusBadRequest)
	}
}
