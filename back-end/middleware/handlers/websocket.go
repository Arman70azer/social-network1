package handlers

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool { //A mettre absolument pour pouvoir traiter les connexions
		// Autoriser toutes les origines
		return true
	},
}

// Define a map to store connected clients
var clients = make(map[*websocket.Conn]bool)

var lastMessage string // Variable globale pour stocker le dernier message reçu

func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	log.Printf("New WebSocket connection from IP address: %s\n", r.RemoteAddr)
	// Upgrade the HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error upgrading connection to WebSocket:", err)
		return
	}
	defer conn.Close()

	// Add the client to the map of connected clients
	clients[conn] = true

	// Read messages from the client
	for {
		// Read the message from the client
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error reading message from client:", err)
			break
		}

		log.Println(len(clients))

		// Compare the new message with the last received message
		if lastMessage != string(message) {
			lastMessage = string(message)

			broadcastMessage("bien")
			// Display the received message
			log.Printf("Received message: %s\n", lastMessage)
			log.Println(lastMessage)
		}
	}

	// Remove the client from the map of connected clients when the connection is closed
	delete(clients, conn)
}

// Define a function to broadcast a message to all connected clients
func broadcastMessage(message string) {
	// Iterate over all connected clients
	for client := range clients {
		// Send the message to each client
		err := client.WriteMessage(websocket.TextMessage, []byte(message))
		if err != nil {
			log.Println("Error sending message to client:", err)
			// If there is an error sending the message to a client,
			// you may choose to handle it according to your application logic
		}
	}
}
