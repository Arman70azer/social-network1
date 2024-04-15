package handlers

import (
	"back-end/structures"
	"fmt"
	"net/http"
)

func HandlerLogin(w http.ResponseWriter, r *http.Request) {

	if r.Method == "POST" {
		fmt.Println("ii")
	}

	var data structures.Data
	ExecuteHtmlWithData(w, "login", data)
}
