package main

import (
	db "back-end/db"
	handlers "back-end/middleware/handlers"
	"fmt"
	"net/http"
)

func main() {
	fmt.Println("hhhh")
	db.Create_db()
	fmt.Println("Server is running at http://localhost:8000")

	http.HandleFunc("/api/login", handlers.HandlerLogin)
	http.HandleFunc("/api/home", handlers.HandlerInfoPostsAndUser)
	http.HandleFunc("/createPost", handlers.CreationPost)
	http.HandleFunc("/websocket", handlers.HandleConnections)
	http.HandleFunc("/api/checkFollow", handlers.HandlerCheckFollow)
	http.HandleFunc("/api/follow", handlers.HandlerFollow)
	http.HandleFunc("/images/", handlers.ServeImage)
	http.HandleFunc("/api/profil", handlers.HandlerProfil)
	http.HandleFunc("/register", handlers.RegisterHandler)

	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		fmt.Println("Error starting the server:", err)
	}
	fmt.Println("Server served")
}
