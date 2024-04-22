package structures

type Post struct {
	ID      int
	Titre   string
	Content string
	Author  User
	Date    string
	Image   string
}

type User struct {
	ID        int
	Nickname  string
	Email     string
	Password  string
	FirstName string
	LastName  string
	Birthday  string
	Age       int
	ImageName string
	AboutMe   string
	UUID      string
}

type Chat struct {
	Messages    []string `json:"messages"`
	Sender      string   `json:"sender"`
	MembersChat []string `json:"memberschat"`
}