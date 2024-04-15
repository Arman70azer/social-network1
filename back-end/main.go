package main

import (
	"fmt"
	"net/http"

	handlers "back-end/middleware/handlers"
)

func main() {

	http.HandleFunc("/register", handlers.HandlerRegister)

	// Servez les fichiers statiques (CSS et JS)
	http.Handle("../front-end/css/", http.StripPrefix("../front-end/css/", http.FileServer(http.Dir("css"))))
	http.Handle("../front-end/js/", http.StripPrefix("../front-end/js/", http.FileServer(http.Dir("js"))))

	// Démarrer le serveur sur le port 8080 dans une goroutine pour pouvoir démarrer d'autres func après http.ListenAndServe
	go func() {
		if err := http.ListenAndServe(":8080", nil); err != nil {
			fmt.Println("Erreur lors du démarrage du serveur :", err)
		}
	}()

	fmt.Println("Serveur démarré sur http://localhost:8080/register")

	// Bloquer indéfiniment pour empêcher le programme de se terminer
	select {}
}
