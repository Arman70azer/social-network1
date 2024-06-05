package handlers

import (
	"back-end/middleware/dbFunc"
	"encoding/json"
	"net/http"
)

func HandlerFollow(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}
	var follow struct {
		UserID_Following int `json:"UserID_Following"`
		UserID_Follower  int `json:"UserID_Follower"`
	}
	err := json.NewDecoder(r.Body).Decode(&follow)
	if err != nil {
		http.Error(w, "Erreur de décodeur JSON", http.StatusBadRequest)
		return
	}
	db := dbFunc.Open_db()
	defer db.Close()
	_, err = db.Exec("INSERT INTO Follow (UserID_Following, UserID_Follower) VALUES (?, ?)", follow.UserID_Following, follow.UserID_Follower)
	if err != nil {
		http.Error(w, "Erreur lors de l'ajout de l'abonnement", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(struct {
		Message string `json:"message"`
		Success bool   `json:"success"`
	}{
		Message: "Abonnement réussi",
		Success: true,
	})
}
