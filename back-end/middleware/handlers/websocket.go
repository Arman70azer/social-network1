package handlers

import (
	"back-end/middleware"
	structures "back-end/middleware/struct"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

// Clients stores connections and names
type Clients struct {
	connections map[string]*websocket.Conn
}

var (
	clients = &Clients{
		connections: make(map[string]*websocket.Conn),
	}
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
)

// Le main de la page websocket
func HandleConnections(w http.ResponseWriter, r *http.Request) {
	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	defer conn.Close()

	// Handle WebSocket connection
	handleWebSocket(conn)
}

// S'occupe de gèrer les clients en les enregistrant et en lisant leur messages
func handleWebSocket(conn *websocket.Conn) {
	// Read name and other data from the client
	_, data, err := conn.ReadMessage()
	if err != nil {
		log.Println("Read message error:", err)
		return
	}

	var clientMsg structures.Request
	err = json.Unmarshal(data, &clientMsg)
	if err != nil {
		log.Println("JSON decoding error:", err)
		return
	}

	// Extract user name from clientMsg
	userName := clientMsg.User

	// If this is the first time client is connecting
	if _, exists := clients.connections[userName]; !exists {
		// Associate user name with WebSocket connection

		clients.connections[userName] = conn

		fmt.Println("New user connected:", userName)
		userDisconnectOrConnect(clients, userName)
	} else {

		clients.connections[userName] = conn
		fmt.Println("User reconnected:", userName)
	}

	// Send welcome message or perform other actions if needed
	var response structures.Request
	response.ObjectOfRequest = "Welcome, " + userName + "!"
	response.Accept = true
	response.User = userName

	BroadcastToOneClient(userName, response)

	// Handle messages from the client

	for {
		_, msgBytes, err := conn.ReadMessage()
		if err != nil {
			log.Println("(boucle for) Read message error:", err)
			break
		}
		// Décoder le message JSON dans une structure de données
		var clientMsg structures.Request
		err = json.Unmarshal(msgBytes, &clientMsg)
		if err != nil {
			log.Println("JSON decoding error:", err)
			continue // Ignorer les messages mal formés
		}

		if clientMsg.Nature == "chat" {
			Tchat(clients, clientMsg)
		} else {

			fmt.Println("Message (non tchat): ", clientMsg)
		}
	}

	// Remove the connection from the map of clients
	delete(clients.connections, userName)
	userDisconnectOrConnect(clients, userName)
}

func BroadcastToOneClient(client string, msg structures.Request) {

	jsonMessage := middleware.ConvertToJson(msg)

	// Parcourir les connexions clients
	for uuid, conn := range clients.connections {
		if uuid == client {
			// Envoyer le message JSON à la connexion correspondante
			err := conn.WriteMessage(websocket.TextMessage, jsonMessage)
			if err != nil {
				log.Println("Write message error:", err)
				conn.Close()
				delete(clients.connections, uuid)
			}
		}
	}
}

func Broadcast(msg structures.Request) {

	jsonMessage := middleware.ConvertToJson(msg)

	for userName, conn := range clients.connections {
		err := conn.WriteMessage(websocket.TextMessage, jsonMessage)
		if err != nil {
			log.Println("Write message error:", err)
			conn.Close()
			delete(clients.connections, userName)
		}
	}
}
