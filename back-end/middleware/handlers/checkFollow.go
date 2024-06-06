package handlers

import (
	"back-end/middleware/dbFunc"
	"encoding/json"
	"net/http"
)

func HandlerCheckFollow(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	follower := r.URL.Query().Get("follower")
	following := r.URL.Query().Get("following")
	db := dbFunc.Open_db()
	defer db.Close()
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM Follow WHERE UserID_Follower = ? AND UserID_Following = ?", follower, following).Scan(&count)
	if err != nil {
		http.Error(w, "Erreur interne du serveur", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(struct {
		IsFollowing bool `json:"isFollowing"`
	}{
		IsFollowing: count > 0,
	})
}
