package main

import (
	db "back-end/db"
	handlers "back-end/middleware/handlers"
	"fmt"
	"net/http"
)

func main() {
	db.Create_db()
	fmt.Println("Server is running at http://localhost:8000")
	http.HandleFunc("/api/home", handlers.HandlerHome)
	http.HandleFunc("/createPost", handlers.CreationPost)
	http.HandleFunc("/websocket", handlers.HandleWebSocket)

	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		fmt.Println("Error starting the server:", err)
	}
	fmt.Println("Server served")
}
