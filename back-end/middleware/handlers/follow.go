package handlers

import (
	"back-end/middleware"
	"back-end/middleware/dbFunc"
	structures "back-end/middleware/struct"
	"database/sql"
	"fmt"
	"net/http"
	"time"
)

type response struct {
	UserProfil structures.Follow `json:"userProfil"`
	Action     string            `json:"action"`
	Accept     bool              `json:"Accept"`
	PrivateSub bool              `json:"privateSub"`
}

func HandlerFollow(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")
	if r.Method == http.MethodPost {
		db := dbFunc.Open_db()
		token := r.FormValue("token")
		userToFollow := r.FormValue("userProfil")
		nature := r.FormValue("nature")

		userProfil := dbFunc.SelectUserByNickname_db(db, userToFollow)
		user := dbFunc.SelectUserByToken(db, token)
		var response response
		if nature == "" {
			followedUsers := dbFunc.FollowedUsers(db, userProfil)
			subrscibers := dbFunc.SelectSubscribers(db, userProfil)
			// Calculer les utilisateurs que je suis et qui me suivent
			subPlusFollow := intersectUsers(subrscibers, followedUsers)

			// Remplir la structure de réponse
			response.Accept = true
			response.UserProfil.PeopleIFollowAndFollowMe = subPlusFollow
			response.UserProfil.PeopleWhoFollowMe = subrscibers
			response.UserProfil.PeopleIFollow = followedUsers
			response.UserProfil.PrivateSub = getPrivateSub(db, user.ID)
			privatesSubProfil := getPrivateSub(db, userProfil.ID)
			for i := 0; i < len(privatesSubProfil); i++ {
				if privatesSubProfil[i].Nickname == user.Nickname {
					response.PrivateSub = true
					break
				} else {
					response.PrivateSub = false
				}
			}

		} else if nature == "follow" {
			if dbFunc.CheckIfFollowing(db, user.ID, userProfil.ID) {
				dbFunc.RemoveFollow(db, user.ID, userProfil.ID)
				response.Accept = true
				response.Action = "You're not subscribe anymore"
			} else {
				if userProfil.Profil == "private" {
					if checkPrivateSub(db, userProfil.ID, user.ID) {
						removePrivateFollow(db, userProfil.ID, user.ID)
						response.Accept = true
						response.Action = "cancel request private profil"
					} else {
						addPrivateSub(db, userProfil.ID, user.ID)
						response.Accept = true
						response.Action = "Wait for a response of profil"
					}
				} else {
					dbFunc.AddFollow(db, user.ID, userProfil.ID)
					response.Accept = true
					response.Action = "You're now subscribe"
				}
			}
		} else if nature == "accept follow" {
			acceptPrivateFollow(db, user, userProfil)
			response.Accept = true
			response.Action = userProfil.Nickname

			var newMess structures.Request
			newMess.Accept = true
			newMess.ObjectOfRequest = "actualise notif profil"

			BroadcastToOneClient(user.UUID, newMess)
		} else if nature == "refuse follow" {
			removePrivateFollow(db, user.ID, userProfil.ID)
			response.Accept = true
			response.Action = userProfil.Nickname

			var newMess structures.Request
			newMess.Accept = true
			newMess.ObjectOfRequest = "actualise notif profil"

			BroadcastToOneClient(user.UUID, newMess)
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

func checkPrivateSub(db *sql.DB, userProfilID, userID int) bool {
    query := `SELECT COUNT(*) FROM PrivateSub WHERE RecipientID = ? AND SenderID = ?`
    var count int
    err := db.QueryRow(query, userProfilID, userID).Scan(&count)
    if err != nil {
        fmt.Println("Error checking private subscription:", err)
        return false
    }
    return count > 0
}


// ---------------------ici---------------------
func addPrivateSub(db *sql.DB, recipientID, senderID int) {
	query := `INSERT INTO PrivateSub (RecipientID, SenderID, Timestamp) VALUES (?, ?, ?)`
	_, err := db.Exec(query, recipientID, senderID, time.Now().Format(time.RFC3339))
	if err != nil {
		fmt.Println("Error adding notification:", err)
	} else {
		fmt.Println("Notification added successfully for recipientID:", recipientID, "senderID:", senderID)
	}
}
func getPrivateSub(db *sql.DB, userID int) []structures.User {
	var notifications []structures.Notification
	var users []structures.User

	query := `SELECT ID, SenderID, Timestamp FROM PrivateSub WHERE RecipientID = ? ORDER BY Timestamp DESC`
	rows, err := db.Query(query, userID)
	if err != nil {
		fmt.Println("ERROR getNotification:", err)
		return users
	}
	defer rows.Close()

	for rows.Next() {
		var notification structures.Notification
		err := rows.Scan(&notification.ID, &notification.SenderID, &notification.Timestamp)
		if err != nil {
			fmt.Println("ERROR2 getPrivateSub:", err)
			return users
		}
		notifications = append(notifications, notification)
	}

	for i := 0; i < len(notifications); i++ {
		user := dbFunc.SelectUserByID_db(notifications[i].SenderID, db)
		user.Password = ""
		users = append(users, user)
	}

	return users
}

func removePrivateFollow(db *sql.DB, recipientID, senderID int) {
	query := `DELETE FROM PrivateSub WHERE RecipientID = ? AND SenderID = ?`
	_, err := db.Exec(query, recipientID, senderID)
	if err != nil {
		fmt.Println("Error removing follow:", err)
	} else {
		fmt.Println("Follow removed successfully for recipientID:", recipientID, "senderID:", senderID)
	}
}

func acceptPrivateFollow(db *sql.DB, user, sub structures.User) {
	removePrivateFollow(db, user.ID, sub.ID)
	dbFunc.AddFollow(db, sub.ID, user.ID)
}
