package main

import (
	db "back-end/db"
	"fmt"
	"net/http"
)

func main() {
	db.Create_db()
	fmt.Println("Server is running at http://localhost:8000")
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Hello, World!")
	})

	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		fmt.Println("Error starting the server:", err)
	}
	fmt.Println("Server served")
}
