package handlers

import (
	"back-end/structures"
	"net/http"
)

func HandlerRegister(w http.ResponseWriter, r *http.Request) {

	var data structures.Data

	data.Requete = "ds"

	ExecuteHtmlWithData(w, "register", data)
}
