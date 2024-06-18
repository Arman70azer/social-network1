package handlers

import (
	"back-end/middleware"
	"back-end/middleware/dbFunc"
	structures "back-end/middleware/struct"
	"encoding/json"
	"fmt"
	"net/http"
)

type response struct {
	UserProfil structures.Follow `json:"userProfil"`
	Action     string            `json:"action"`
	Accept     bool              `json:"Accept"`
}

func HandlerFollow(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")
	if r.Method == http.MethodPost {
		db := dbFunc.Open_db()
		defer db.Close()
		token := r.FormValue("token")
		userToFollow := r.FormValue("userProfil")
		nature := r.FormValue("nature")

		userProfil := dbFunc.SelectUserByNickname_db(db, userToFollow)
		user := dbFunc.SelectUserByToken(db, token)
		var response response
		if nature == "" {
			followedUsers := dbFunc.FollowedUsers(db, userProfil)
			subscribers := dbFunc.SelectSubscribers(db, userProfil)
			// Calculer les utilisateurs que je suis et qui me suivent
			subPlusFollow := intersectUsers(subscribers, followedUsers)
			fmt.Println("subscribers", subscribers)
			fmt.Println("people i follow", followedUsers)

			// Remplir la structure de réponse
			response.Accept = true
			response.UserProfil.PeopleIFollowAndFollowMe = subPlusFollow
			response.UserProfil.PeopleWhoFollowMe = subscribers
			response.UserProfil.PeopleIFollow = followedUsers

		} else if nature == "follow" {
			if dbFunc.CheckIfFollowing(db, user.ID, userProfil.ID) {
				dbFunc.RemoveFollow(db, user.ID, userProfil.ID)
				response.Accept = true
				response.Action = "You're not subscribe anymore"
			} else {
				if userProfil.Profil == "public" {
					dbFunc.AddFollow(db, user.ID, userProfil.ID)
					response.Accept = true
					response.Action = "You're now subscribe"
				} else if userProfil.Profil == "private" {
					dbFunc.AddSubscriptionRequest(db, user.ID, userProfil.ID)
					response.Accept = true
					response.Action = "Subscription request sent"
					dbFunc.AddNotification(db, userProfil.ID, user.ID, "follow_request")
				}
			}
			// Mettre à jour les followers après l'action
			followedUsers := dbFunc.FollowedUsers(db, userProfil)
			subscribers := dbFunc.SelectSubscribers(db, userProfil)
			subPlusFollow := intersectUsers(subscribers, followedUsers)

			response.UserProfil.PeopleIFollowAndFollowMe = subPlusFollow
			response.UserProfil.PeopleWhoFollowMe = subscribers
			response.UserProfil.PeopleIFollow = followedUsers
		}
		middleware.ReturnWithW(w, response)
	}
}

// Fonction utilitaire pour trouver l'intersection de deux listes d'utilisateurs
func intersectUsers(list1, list2 []structures.User) []structures.User {
	m := make(map[int]bool)
	for _, user := range list1 {
		m[user.ID] = true
	}
	var intersection []structures.User
	for _, user := range list2 {
		if m[user.ID] {
			intersection = append(intersection, user)
		}
	}
	return intersection
}

// Fonction utilitaire pour envoyer une réponse en JSON
func ReturnWithW(w http.ResponseWriter, data interface{}) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Write(jsonData)
}
