package handlers

import (
	structures "back-end/middleware/struct"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Define a struct to store client information
type Client struct {
	conn   *websocket.Conn
	User   string
	Origin string
}

var Upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Define a map to store connected clients
var clients = make(map[*websocket.Conn]*Client)
var mu sync.Mutex // To ensure thread-safety

func HandleConnections(w http.ResponseWriter, r *http.Request) {

	log.Println("Quelqu'un c'est connecté sur le ws")

	// Upgrade initial GET request to a websocket
	ws, err := Upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	messageInit := readMessage(ws)

	if clientAlreadyRegister_WS(messageInit.User) && strings.Contains(messageInit.Nature, "enter") {
		log.Printf("client -" + messageInit.User + "exit page to: " + messageInit.Origin)
		deleteClient(messageInit.User)
	}

	// Create a new client instance
	client := &Client{conn: ws, User: messageInit.User, Origin: messageInit.Origin}

	// Add the client to the map of clients
	clients[ws] = client

	// Send a welcome message
	var welcomeRequest structures.Request
	welcomeRequest.Nature = "Welcome " + messageInit.User
	welcomeRequest.Origin = "websocket"
	welcomeRequest.Date = time.Now().Format("02/01/2006 15:04:05")
	welcomeRequest.User = messageInit.User

	BroadcastMessageOneClient(welcomeRequest)

	// Example: Listen for messages from this client
	for {
		_, message, err := ws.ReadMessage()
		if err != nil {
			log.Printf("Client disconnected: %v", err)
			delete(clients, ws) // Remove the client from the map when disconnected
			break
		}
		if message != nil {
			var data structures.Request
			if err := json.Unmarshal(message, &data); err != nil {
				log.Printf("Erreur lors de la conversion en JSON : %v", err)
				continue
			}

			// Accéder aux champs de la structure Request
			fmt.Println("Origin:", data)
			fmt.Println(clients[ws].User)

		}

	}
}

// Sert à savoir si les utilisateurs sont toujours connecter. S'active toutes les 10 secondes
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

// Envoie le message au client souhaiter pour répondre à une requête précise.
// Pense aussi à rajouter l'user pour savoir à qui envoyer le message!!!
func BroadcastMessageOneClient(request structures.Request) {
	// Envoyer le message au client spécifié
	jsonData, err := json.Marshal(request)
	if err != nil {
		fmt.Println("Erreur lors de la conversion en JSON:", err)
	}

	for conn, client := range clients {
		if client.User == request.User {
			err := conn.WriteMessage(websocket.TextMessage, jsonData)
			if err != nil {
				log.Printf("Error sending message to client: %v", err)
				conn.Close()
				delete(clients, conn) // Remove the client from the map if unable to send message
			} else {
				fmt.Println("le message à été envoyé")
			}
		}
	}
}

// Envoie un message à tout les users connectés qui sont stockés dans clients
func BroadcastMessageToAllClients(request structures.Request) {
	// Envoyer le message au client spécifié
	jsonData, err := json.Marshal(request)
	if err != nil {
		fmt.Println("Erreur lors de la conversion en JSON:", err)
	}

	for conn, _ := range clients {
		err := conn.WriteMessage(websocket.TextMessage, jsonData)
		if err != nil {
			log.Printf("Error sending message to client: %v", err)
			conn.Close()
			delete(clients, conn) // Remove the client from the map if unable to send message
		} else {
			fmt.Println("le message à été envoyé")
		}
	}
}

// Lit les messages envoyées sous la forme de la struct "Requete" (ne pas oublier!!!)
func readMessage(ws *websocket.Conn) structures.Request {
	var data structures.Request
	_, message, err := ws.ReadMessage()
	if err != nil {
		log.Printf("Client disconnected: %v", err)
		delete(clients, ws) // Remove the client from the map when disconnected
	}
	if message != nil {
		if err := json.Unmarshal(message, &data); err != nil {
			log.Printf("Erreur lors de la conversion en JSON : %v", err)
		}

	}
	return data
}

// Check if client is already registered
func clientAlreadyRegister_WS(user string) bool {
	mu.Lock()
	defer mu.Unlock()
	for _, client := range clients {
		if client.User == user {
			return true
		}
	}
	return false
}

// Function to delete a client
func deleteClient(user string) {
	mu.Lock()
	defer mu.Unlock()

	for conn, client := range clients {
		if client.User == user {
			log.Printf("client -" + user + " exits page to other")
			conn.Close()          // Close the WebSocket connection
			delete(clients, conn) // Delete the client from the map
			fmt.Println("nb clients: " + strconv.Itoa(len(clients)))
			return
		}
	}
	log.Printf("client -" + user + " not found")
}
