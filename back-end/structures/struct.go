package structures

import "mime/multipart"

type Data struct {
	Requete string
}

type AllFormValues struct {
	Email     string
	Password  string
	Nickname  string
	Birthday  string
	AboutME   string
	Form      string
	Firstname string
	Lastname  string
	ImageFile Picture //Retourne sur la struct Picture
}

type Picture struct {
	Image  multipart.File
	Header *multipart.FileHeader
}
