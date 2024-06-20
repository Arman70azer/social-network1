package handlers

import (
	"back-end/middleware"
	"back-end/middleware/dbFunc"
	structures "back-end/middleware/struct"
	"database/sql"
	"fmt"
	"log"
	"time"
)

func Tchat(clients *Clients, message structures.Request) {
	if message.ObjectOfRequest == "see users connect" {
		db := dbFunc.Open_db()
		userID := dbFunc.SelectUserByToken(db, message.User).ID
		connectUsers := whoIsConnect(clients)
		message.Accept = true
		message.Origin = "tchat"
		var object structures.Tchat
		object.ClientsConnect = connectUsers
		object.Clients = dbFunc.SelectAllUsers_db(db)
		object.Messages = dbFunc.SelectAllChats(db, userID)
		message.Tchat = object
		message.Tchat.Group = dbFunc.GetsGroups(db, userID)

		Broadcast(message)
		for i := 0; i < len(object.ClientsConnect); i++ {
			message.Tchat.AuthorNotSee = dbFunc.SelectAuthorNotSee(db, object.ClientsConnect[i].ID)
			message.Tchat.Group = dbFunc.GetsGroups(db, object.ClientsConnect[i].ID)
			message.Tchat.Invitations = dbFunc.GetsGroupInvitation(db, object.ClientsConnect[i].ID)
			BroadcastToOneClient(dbFunc.SelectUUID(db, object.ClientsConnect[i].Nickname), message)
		}

	} else if message.ObjectOfRequest == "new message" {
		newMessage(message)
	} else if message.ObjectOfRequest == "user see message" {
		chatSee(message)
	} else if message.ObjectOfRequest == "notifications" {
		db := dbFunc.Open_db()
		message.Tchat.AuthorNotSee = dbFunc.SelectAuthorNotSee(db, dbFunc.SelectUserByToken(db, message.User).ID)
		message.Tchat.Group = dbFunc.GetsGroups(db, dbFunc.SelectUserByToken(db, message.User).ID)
		message.Accept = true
		BroadcastToOneClient(message.User, message)
	} else if message.ObjectOfRequest == "new group" {
		newGroup(message)
	} else if message.ObjectOfRequest == "new message group" {
		newMessageGroup(message)
	} else if message.ObjectOfRequest == "message group see" {
		userSeeMessageGroup(message)
	} else if message.ObjectOfRequest == "accept invitation" {
		fmt.Println("sdsdsdqsddsqd")
		acceptInvitation(message)
	} else if message.ObjectOfRequest == "decline invitation" {
		db := dbFunc.Open_db()
		user := dbFunc.SelectUserByToken(db, message.User)
		groupID, _ := dbFunc.GetGroupID(db, message.ToUser)
		deleteInvitation(db, user.ID, groupID)
	} else if message.ObjectOfRequest == "new member" {
		db := dbFunc.Open_db()
		user := dbFunc.SelectUserByNickname_db(db, message.ToUser)
		groupID, _ := dbFunc.GetGroupID(db, message.Message)
		newInvitation(db, groupID, user.ID)
	}
}

func whoIsConnect(clients *Clients) []structures.User {
	var uuidUsers []string
	var usersConnect []structures.User
	for userName, _ := range clients.connections {

		uuidUsers = append(uuidUsers, userName)
	}

	for _, userUUID := range uuidUsers {
		user := dbFunc.SelectUserByToken(dbFunc.Open_db(), userUUID)
		user.Password = ""
		user.UUID = ""
		usersConnect = append(usersConnect, user)
	}

	return usersConnect
}

func userDisconnectOrConnect(clients *Clients, userDisconnect string) {
	var message structures.Request
	message.Accept = true
	message.Nature = "user disconnect or first connexions"
	message.User = dbFunc.SelectUserByToken(dbFunc.Open_db(), userDisconnect).Nickname
	message.Tchat.ClientsConnect = whoIsConnect(clients)
	message.Tchat.Clients = dbFunc.SelectAllUsers_db(dbFunc.Open_db())

	Broadcast(message)
}

func newMessage(message structures.Request) {
	db := dbFunc.Open_db()
	user := dbFunc.SelectUserByToken(db, message.User)
	recipient := dbFunc.SelectUserByNickname_db(db, message.ToUser)
	message.Date = time.Now().Format("02/01/2006 15:04")

	var response structures.Request
	response.Nature = message.Nature
	response.Date = message.Date
	response.User = user.Nickname
	response.ToUser = recipient.Nickname

	if dbFunc.CheckIfFollowing(db, user.ID, recipient.ID) && dbFunc.CheckIfFollowing(db, recipient.ID, user.ID) && middleware.RegexSpaceAndScript(message.Message) {
		dbFunc.PushNewMessage_db(db, message, user.ID, recipient.ID)
		response.Accept = true
		response.ObjectOfRequest = "message save"
		var newMessage structures.Message
		newMessage.Author = user.Nickname
		newMessage.Recipient = recipient.Nickname
		newMessage.Date = message.Date
		newMessage.Content = message.Message
		response.Tchat.Messages = append(response.Tchat.Messages, newMessage)
		BroadcastToOneClient(dbFunc.SelectUUID(db, recipient.Nickname), response)
	} else {
		response.Accept = false
		response.ObjectOfRequest = "You're not following this user or he don't follow you"
	}

	BroadcastToOneClient(message.User, response)
}

// func chatNotSee(message structures.Request) {
// 	db := dbFunc.Open_db()
// 	recipient := dbFunc.SelectUserByToken(db, message.User)
// 	author := dbFunc.SelectUserByNickname_db(db, message.ToUser)
// 	content := message.Message

// 	updateChatSee(db, recipient.ID, author.ID, content, false)

// }

// // Sélectionne une row pour changer la valeur de See
// func updateChatSee(db *sql.DB, recipientID, authorID int, content string, see bool) {
// 	_, err := db.Exec("UPDATE ChatsUsers SET See = ? WHERE Recipient = ? AND Author = ? AND Message = ?", see, recipientID, authorID, content)
// 	if err != nil {
// 		fmt.Println("error updateChatSee:", err)
// 	}
// }

func chatSee(message structures.Request) {
	db := dbFunc.Open_db()
	user := dbFunc.SelectUserByToken(db, message.User)
	author := dbFunc.SelectUserByNickname_db(db, message.ToUser)

	updateChatSee2(db, user.ID, author.ID, true)

}

func updateChatSee2(db *sql.DB, userID, authorID int, see bool) {
	query := `
		UPDATE ChatsUsers
		SET See = ?
		WHERE Recipient = ? AND Author = ? AND See <> ?
	` //<> il indique l'iverse de la valeur ici true et false
	_, err := db.Exec(query, see, userID, authorID, see)
	if err != nil {
		fmt.Println("error updateChatSee2:", err)
	}
}

func newGroup(message structures.Request) {
	db := dbFunc.Open_db()
	user := dbFunc.SelectUserByToken(db, message.User)
	var response structures.Request
	response.Nature = message.Nature
	response.ObjectOfRequest = message.ObjectOfRequest

	if VerifGroupNotExist(db, message.Message) {
		pushNewGroup(db, user.ID, message.Users, message.Message)
		response.Accept = true

		response.Tchat.Group = dbFunc.GetsGroups(db, user.ID)

		response.Message = "Group register"

	} else {
		response.Accept = false
		response.Message = "Group already exist"
	}
	BroadcastToOneClient(message.User, response)
}

func VerifGroupNotExist(db *sql.DB, nameGroup string) bool {
	// Vérifie si le nom du groupe respecte le regex
	if !middleware.RegexSpaceAndScript(nameGroup) {
		return false
	}

	// Prépare la requête pour vérifier l'existence du groupe
	query := "SELECT GroupName FROM GroupChat WHERE GroupName = ?"
	row := db.QueryRow(query, nameGroup)

	var groupName string
	err := row.Scan(&groupName)

	// Si une erreur est retournée par Scan, cela signifie que le groupe n'existe pas
	if err == sql.ErrNoRows {
		return true
	}

	// Si une autre erreur est retournée ou si le groupe existe, retourne false
	if err != nil {
		fmt.Println("Database error:", err)
		return false
	}

	return false
}

func pushNewGroup(db *sql.DB, userID int, users []structures.User, nameGroupe string) {
	timeNow := time.Now().Format("02/01/2006 15:04:05")

	// Start a transaction
	tx, err := db.Begin()
	if err != nil {
		log.Fatalf("Failed to begin transaction: %v", err)
	}

	// Insert the new group into GroupChat
	res, err := tx.Exec("INSERT INTO GroupChat (GroupName, Date) VALUES (?, ?)", nameGroupe, timeNow)
	if err != nil {
		tx.Rollback()
		log.Fatalf("Failed to insert new group: %v", err)
	}

	// Get the ID of the newly created group
	groupID, err := res.LastInsertId()
	if err != nil {
		tx.Rollback()
		log.Fatalf("Failed to get last insert ID: %v", err)
	}

	// Insert the creator into GroupMembers
	_, err = tx.Exec("INSERT INTO GroupMembers (GroupID, Member) VALUES (?, ?)", groupID, userID)
	if err != nil {
		tx.Rollback()
		log.Fatalf("Failed to insert group creator: %v", err)
	}

	// Insert the users into GroupMembers
	for _, user := range users {
		_, err = tx.Exec("INSERT INTO GroupInvitation (GroupID, UserID) VALUES (?, ?)", groupID, user.ID)
		if err != nil {
			tx.Rollback()
			log.Fatalf("Failed to insert group member: %v", err)
		}
	}

	// Commit the transaction
	err = tx.Commit()
	if err != nil {
		log.Fatalf("Failed to commit transaction: %v", err)
	}

	fmt.Println("Group and members added successfully")
}

func newMessageGroup(message structures.Request) {
	db := dbFunc.Open_db()
	user := dbFunc.SelectUserByToken(db, message.User)
	group := message.ToUser
	content := message.Message

	if middleware.RegexSpaceAndScript(message.Message) {
		insertNewMessageGroup(db, user.ID, group, content)
		message.Accept = true
		message.User = user.Nickname
		members := dbFunc.GetGroupMembers(db, group)
		var newMessage structures.Message
		newMessage.Author = user.Nickname
		newMessage.Content = content
		newMessage.Date = time.Now().Format("02/01/2006 15:04")
		newMessage.Groupe = group
		message.Tchat.Messages = append(message.Tchat.Messages, newMessage)
		for i := 0; i < len(members); i++ {
			BroadcastToOneClient(dbFunc.SelectUserByNickname_db(db, members[i].Nickname).UUID, message)
		}
	} else {
		message.Accept = false
		message.Message = "Injection or empty message"
		BroadcastToOneClient(message.User, message)
	}

}

func insertNewMessageGroup(db *sql.DB, userID int, groupName, content string) {
	// Insérer le nouveau message dans la table GroupChatConv
	queryInsertMessage := `
		INSERT INTO GroupChatConv (GroupID, UserID, Content, Date)
		SELECT gc.ID, ?, ?, strftime('%d/%m/%Y %H:%M', 'now')
		FROM GroupChat gc
		WHERE gc.GroupName = ?`

	result, err := db.Exec(queryInsertMessage, userID, content, groupName)
	if err != nil {
		fmt.Println("Error inserting new message into GroupChatConv:", err)
		return
	}

	// Récupérer les membres du groupe
	members := dbFunc.GetGroupMembers(db, groupName)

	// Récupérer l'ID du dernier message inséré
	lastInsertID, err := result.LastInsertId()
	if err != nil {
		fmt.Println("Error getting last insert ID:", err)
		return
	}

	// Insérer des entrées dans GroupChatSee pour chaque membre du groupe
	queryInsertSee := `
		INSERT INTO GroupChatSee (ChatID, UserID, Seen)
		VALUES (?, ?, ?)`

	stmt, err := db.Prepare(queryInsertSee)
	if err != nil {
		fmt.Println("Error preparing statement for GroupChatSee:", err)
		return
	}
	defer stmt.Close()

	for _, member := range members {
		seen := 0
		if member.ID == userID {
			seen = 1 // L'auteur du message voit automatiquement le message
		}

		_, err := stmt.Exec(lastInsertID, member.ID, seen)
		if err != nil {
			fmt.Println("Error inserting into GroupChatSee:", err)
			return
		}
	}
}

func userSeeMessageGroup(message structures.Request) {
	db := dbFunc.Open_db()
	user := dbFunc.SelectUserByToken(db, message.User)
	group := message.ToUser

	var group1 structures.Group

	messageGroupSee(db, user.ID, group)

	var response structures.Request
	response.Nature = message.Nature
	response.ObjectOfRequest = message.ObjectOfRequest
	response.Accept = true
	groups := dbFunc.GetsGroups(db, user.ID)

	for i := 0; i < len(groups); i++ {
		if groups[i].Name == group {
			group1 = groups[i]
		}
	}
	response.Tchat.Group = append(response.Tchat.Group, group1)

	BroadcastToOneClient(user.UUID, response)
}

func messageGroupSee(db *sql.DB, userID int, groupName string) {
	// Requête pour obtenir l'ID du groupe à partir du nom du groupe
	var groupID int
	err := db.QueryRow("SELECT ID FROM GroupChat WHERE GroupName = ?", groupName).Scan(&groupID)
	if err != nil {
		fmt.Println("Error fetching group ID:", err)
		return
	}

	// Requête pour mettre à jour les messages non vus pour cet utilisateur dans ce groupe
	updateQuery := `
        UPDATE GroupChatSee 
        SET Seen = 1 
        WHERE ChatID IN (
            SELECT gcc.ID 
            FROM GroupChatConv gcc
            WHERE gcc.GroupID = ?
        )
        AND UserID = ?`

	_, err = db.Exec(updateQuery, groupID, userID)
	if err != nil {
		fmt.Println("Error updating GroupChatSee:", err)
	}
}

func acceptInvitation(message structures.Request) {

	db := dbFunc.Open_db()

	user := dbFunc.SelectUserByToken(db, message.User)

	groupID, err := dbFunc.GetGroupID(db, message.ToUser)
	if err != nil {
		fmt.Println("Error getting group ID:", err)
		return
	}

	// Insérer l'utilisateur dans le groupe
	_, err = db.Exec("INSERT INTO GroupMembers (GroupID, Member) VALUES (?, ?)", groupID, user.ID)
	if err != nil {
		fmt.Println("Error inserting into GroupMembers:", err)
	}

	deleteInvitation(db, user.ID, groupID)
}

func deleteInvitation(db *sql.DB, userID, groupID int) {
	_, err := db.Exec("DELETE FROM GroupInvitation WHERE GroupID = ? AND UserID = ?", groupID, userID)
	if err != nil {
		fmt.Println("Error in deleteInvitation:", err)
	}
}

func newInvitation(db *sql.DB, groupID, userID int) {
	// Insert the users into GroupMembers
	_, err := db.Exec("INSERT INTO GroupInvitation (GroupID, UserID) VALUES (?, ?)", groupID, userID)
	if err != nil {
		log.Fatalf("Failed to insert group member: %v", err)
	}
}
