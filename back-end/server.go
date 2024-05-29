package main

import (
	db "back-end/db"
	"back-end/middleware/handlers"
	"fmt"
	"net/http"
)



func main() {
	db.Create_db()
	http.HandleFunc("/login", handlers.HandlerLogin)
	http.HandleFunc("/register", handlers.RegisterHandler)
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		fmt.Println("Error starting the server:", err)
	}
	fmt.Println("Server is running at http://localhost:8000/login")
}

