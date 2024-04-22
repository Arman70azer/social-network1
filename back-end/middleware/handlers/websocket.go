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

func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	log.Printf("Nouvelle connexion WebSocket depuis l'adresse IP: %s\n", r.RemoteAddr)
	// Upgrade de la connexion HTTP vers WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	defer conn.Close()

	// Boucle de lecture des messages du client
	for {
		// Lecture du message du client
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println(err)
			return
		}

		// Affichage du message reçu
		log.Printf("Message reçu: %s", message)

	}
}
