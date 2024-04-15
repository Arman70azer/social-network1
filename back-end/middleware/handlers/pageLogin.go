package handlers

import (
	"back-end/structures"
	"net/http"
)

func HandlerLogin(w http.ResponseWriter, r *http.Request) {
	var data structures.Data

	data.Requete = "ds"

	ExecuteHtmlWithData(w, "login", data)
}
