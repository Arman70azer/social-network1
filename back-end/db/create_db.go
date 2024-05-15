package db

import (
	structures "back-end/middleware/struct"
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"

	_ "github.com/mattn/go-sqlite3"
)

// Va créer la db dès le lancement du serveur
func Create_db() {
	database, err := sql.Open("sqlite3", "db/social-network.db")
	if err != nil {
		log.Fatal("Error opening database:", err)
	}
	defer database.Close()

	tx, err := database.Begin()
	if err != nil {
		log.Fatal("Error starting transaction:", err)
	}

	migrations := allMigrations()

	for _, createTableQuery := range migrations {
		if createTableQuery.Type == "up" {
			_, err := tx.Exec(createTableQuery.Request)
			if err != nil {
				for _, migration := range migrations {
					if migration.Type == "down" && migration.ID == createTableQuery.ID {
						_, err := tx.Exec(migration.Request)
						fmt.Println("migration of type down has been execute ---> " + migration.ID)
						if err != nil {
							log.Println("Erreur lors de l'exécution de la migration de rollback:", err)
							if rollbackErr := tx.Rollback(); rollbackErr != nil {
								log.Fatal("Erreur lors du rollback de la transaction:", rollbackErr)
							}
							return
						}
					}
				}
			}
		}
	}

	err = tx.Commit()
	if err != nil {
		log.Fatal("Error committing transaction:", err)
	}
}

// ReadSQLFile lit le contenu d'un fichier SQL et le retourne sous forme de chaîne de caractères
func readSQLFile(file string) string {
	content, err := os.ReadFile("db/migrations/" + file)
	if err != nil {
		return "erreur lors de la lecture du fichier pour le fichier : " + file
	}
	return string(content)
}

// Renvoie un array contenant toutes les requêtes sql (migrations) à effectuer (up et down)
func allMigrations() []structures.Migrations {
	// Chemin du dossier des migrations
	migrationsDir := "db/migrations"

	// Ouvrir le dossier des migrations
	dir, err := os.Open(migrationsDir)
	if err != nil {
		log.Fatalf("Erreur lors de l'ouverture du dossier des migrations : %v", err)
	}
	defer dir.Close()

	// Lire les noms des fichiers du dossier des migrations
	fileInfos, err := dir.Readdir(-1)
	if err != nil {
		log.Fatalf("Erreur lors de la lecture des fichiers du dossier des migrations : %v", err)
	}

	var upFiles []structures.Migrations

	// Parcourir les noms des fichiers et filtrer ceux qui contiennent "up"
	for _, fileInfo := range fileInfos {
		var upFile structures.Migrations
		if strings.Contains(fileInfo.Name(), "up") {
			upFile.Type = "up"
		} else {
			upFile.Type = "down"
		}
		upFile.Name = fileInfo.Name()
		upFile.Request = readSQLFile(fileInfo.Name())
		upFile.ID = strings.Split(fileInfo.Name(), "_")[0]

		upFiles = append(upFiles, upFile)
	}

	return upFiles
}
