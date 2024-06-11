package handlers

import (
	"back-end/middleware/dbFunc"
	structures "back-end/middleware/struct"
	"fmt"
)

func Tchat(clients *Clients, message structures.Request) {
	fmt.Println("hh:", message)
	if message.ObjectOfRequest == "see users connect" {
		connectUsers := whoIsConnect(clients)
		message.Accept = true
		message.Origin = "tchat"
		var object structures.Tchat
		object.ClientsConnect = connectUsers
		message.Tchat = object

		Broadcast(message)
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

	Broadcast(message)
}
