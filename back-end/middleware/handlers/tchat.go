package handlers

import (
	"back-end/middleware"
	"back-end/middleware/dbFunc"
	structures "back-end/middleware/struct"
	"database/sql"
	"fmt"
	"time"
)

func Tchat(clients *Clients, message structures.Request) {
	fmt.Println("hh:", message)
	if message.ObjectOfRequest == "see users connect" {
		db := dbFunc.Open_db()
		connectUsers := whoIsConnect(clients)
		message.Accept = true
		message.Origin = "tchat"
		var object structures.Tchat
		object.ClientsConnect = connectUsers
		object.Clients = dbFunc.SelectAllUsers_db(db)
		object.Messages = dbFunc.SelectAllChats(db, dbFunc.SelectUserByToken(db, message.User).ID)
		message.Tchat = object

		Broadcast(message)
	} else if message.ObjectOfRequest == "new message" {
		newMessage(message)
	} else if message.ObjectOfRequest == "user not see message" {
		chatNotSee(message)
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

func chatNotSee(message structures.Request) {
	db := dbFunc.Open_db()
	recipient := dbFunc.SelectUserByToken(db, message.User)
	author := dbFunc.SelectUserByNickname_db(db, message.ToUser)
	content := message.Message

	updateChatSee(db, recipient.ID, author.ID, content, false)

	var request structures.Request

	request.Accept = true
	request.Message = message.ObjectOfRequest
	request.User = author.Nickname

	BroadcastToOneClient(message.User, request)

}

func updateChatSee(db *sql.DB, recipientID, authorID int, content string, see bool) {
	_, err := db.Exec("UPDATE ChatsUsers SET See = ? WHERE Recipient = ? AND Author = ? AND Message = ?", see, recipientID, authorID, content)
	if err != nil {
		fmt.Println("error updateChatSee:", err)
	}
}
