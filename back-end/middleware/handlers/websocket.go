package handlers

import (
	structures "back-end/middleware/struct"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/websocket"
)

// Define a struct to store client information
type Client struct {
	conn *websocket.Conn
	User structures.User
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Define a map to store connected clients
var clients = make(map[*websocket.Conn]*Client)

func HandleConnections(w http.ResponseWriter, r *http.Request) {

	// Upgrade initial GET request to a websocket
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	// Create a new client instance
	client := &Client{conn: ws}

	// Add the client to the map of clients
	clients[ws] = client

	// Example: Send a welcome message
	err = ws.WriteMessage(websocket.TextMessage, []byte("Welcome to the server!"))
	if err != nil {
		log.Printf("Error sending welcome message: %v", err)
	}

	// Example: Listen for messages from this client
	for {
		_, _, err := ws.ReadMessage()
		if err != nil {
			log.Printf("Client disconnected: %v", err)
			delete(clients, ws) // Remove the client from the map when disconnected
			break
		}
	}
}

func BroadcastMessages() {
	for {
		// Example: Send a message to all connected clients every 10 seconds
		for conn, _ := range clients {
			err := conn.WriteMessage(websocket.TextMessage, []byte("Hello from the server! Are you here?"))
			if err != nil {
				log.Printf("Error sending message to client: %v", err)
				conn.Close()
				delete(clients, conn) // Remove the client from the map if unable to send message
			} else {
				fmt.Println("Il y a " + strconv.Itoa(len(clients)) + " de connecter: " + conn.Subprotocol())
			}
			// You can access client data here if needed
		}

		// Sleep for 10 seconds
		time.Sleep(10 * time.Second)
	}
}
