package handlers

import (
	"back-end/middleware/dbFunc"
	structures "back-end/middleware/struct"
	"fmt"
)

type object struct {
	clientsConnect []structures.User
}

func Tchat(clients *Clients, message structures.Request) {
	fmt.Println("hh:", message)
	if message.ObjectOfRequest == "see users connect" {
		connectUsers := whoIsConnect(clients, message.User)
		message.Accept = true
		message.Origin = "tchat"
		var object object
		object.clientsConnect = connectUsers
		message.Object = object

		BroadcastToOneClient(message.User, message)
	}
}

func whoIsConnect(clients *Clients, uuidUser string) []structures.User {
	var uuidUsers []string
	var usersConnect []structures.User
	for userName, _ := range clients.connections {
		if userName != uuidUser {
			uuidUsers = append(uuidUsers, userName)
		}
	}

	for _, userUUID := range uuidUsers {
		usersConnect = append(usersConnect, dbFunc.SelectUserByToken(dbFunc.Open_db(), userUUID))
	}

	return usersConnect
}
