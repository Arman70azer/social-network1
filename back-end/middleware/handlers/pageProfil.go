package handlers

import (
	"back-end/middleware"
	"back-end/middleware/dbFunc"
	structures "back-end/middleware/struct"
	"database/sql"
	"fmt"
	"net/http"
)

func HandlerProfil(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type") // Autoriser l'en-tête Content-Type
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodPost {
		var data structures.Data
		var request structures.Request
		token := r.FormValue("token")
		db := dbFunc.Open_db()
		user := dbFunc.SelectUserByToken(db, token)
		nature := r.FormValue("nature")
		change := r.FormValue("change")

		request.Accept = true
		request.Nature = nature
		request.ObjectOfRequest = change
		request.User = user.Nickname

		if nature == "Nickname" && middleware.RegexSpaceAndScript(change) {

			if nicknameAlreadyTake(db, change) {
				request.Accept = false
				request.ObjectOfRequest = "Nickname already exist"

			} else {
				updateNickname(db, user, change)
			}
			middleware.ReturnWithW(w, request)
		} else if nature == "Password" && middleware.RegexSpaceAndScript(change) {
			updatePassword(db, user, change)

			request.ObjectOfRequest = "Password has been change with success!"

			middleware.ReturnWithW(w, request)

		} else if nature == "AboutMe" && middleware.RegexSpaceAndScript(change) {
			updateAboutMe(db, user, change)

			request.ObjectOfRequest = change
			middleware.ReturnWithW(w, request)
		} else if nature == "SwitchMode" {
			profil := updateProfil(db, user)

			request.ObjectOfRequest = "Mode " + profil + " activate "
			middleware.ReturnWithW(w, request)
		} else {
			data.Users = append(data.Users, user)
			data.Groups = dbFunc.GetsGroups(db, user.ID)

			middleware.ReturnWithW(w, data)
		}
	}
}

func updateNickname(db *sql.DB, user structures.User, newNickname string) {
	_, err := db.Exec("UPDATE Users SET Nickname = ? WHERE ID = ?", newNickname, user.ID)
	if err != nil {
		fmt.Println("ERROR updateNickname:", err)
	}
}

func updatePassword(db *sql.DB, user structures.User, newPassword string) {
	_, err := db.Exec("UPDATE Users SET Password = ? WHERE ID = ?", newPassword, user.ID)
	if err != nil {
		fmt.Println("ERROR updateNickname:", err)
	}
}

func updateAboutMe(db *sql.DB, user structures.User, newDescription string) {
	_, err := db.Exec("UPDATE Users SET AboutMe = ? WHERE ID = ?", newDescription, user.ID)
	if err != nil {
		fmt.Println("ERROR updateNickname:", err)
	}
}

func updateProfil(db *sql.DB, user structures.User) string {
	var ancientProfil string

	// Récupérer l'ancien profil
	err := db.QueryRow("SELECT Profil FROM Users WHERE ID = ?", user.ID).Scan(&ancientProfil)
	if err != nil {
		fmt.Println("ERROR1 updateProfil:", err)
	}

	// Déterminer le nouveau profil
	var newProfil string
	if ancientProfil == "public" {
		newProfil = "private"
	} else {
		newProfil = "public"
	}

	// Mettre à jour le profil
	_, err = db.Exec("UPDATE Users SET Profil = ? WHERE ID = ?", newProfil, user.ID)
	if err != nil {
		fmt.Println("ERROR2 updateProfil:", err)
	}
	return newProfil
}

func nicknameAlreadyTake(db *sql.DB, nickname string) bool {
	var existingNickname string
	err := db.QueryRow("SELECT Nickname FROM Users WHERE Nickname = ?", nickname).Scan(&existingNickname)

	if err != nil {
		if err == sql.ErrNoRows {
			return false
		}
		fmt.Println("Erreur lors de la vérification du surnom:", err)
		return true
	}
	return true
}
