package main

import (
	handlers "back-end/middleware/handlers"
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/login", handlers.HandlerLogin)
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("Error starting the server:", err)
	}
	fmt.Println("Server is running at http://localhost:8080/login")
}
