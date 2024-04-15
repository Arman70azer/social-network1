package main

import (
	"fmt"
	"net/http"

	handlers "back-end/middleware/handlers"
)

func main() {
	// Démarrer le serveur sur le port 8080 dans une goroutine pour pouvoir démarrer d'autres func après http.ListenAndServe
	go func() {
		http.HandleFunc("/register", handlers.HandlerRegister)
		http.HandleFunc("/login", handlers.HandlerLogin)

		// Servez les fichiers statiques (CSS et JS)
		http.Handle("/css/", http.StripPrefix("/css/", http.FileServer(http.Dir("../front-end/css"))))
		http.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir("../front-end/js"))))

		if err := http.ListenAndServe(":8080", nil); err != nil {
			fmt.Println("Erreur lors du démarrage du serveur :", err)
		}
	}()

	fmt.Println("Serveur démarré sur http://localhost:8080/login")

	// Bloquer indéfiniment pour empêcher le programme de se terminer
	select {}
}
