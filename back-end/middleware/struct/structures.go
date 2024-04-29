package structures

type Post struct {
	ID             int
	Titre          string
	Content        string
	Author         User
	Date           string
	ImageName      string
	UrlImage       string
	Type           string
	PrivateViewers []User
	Commentaries   []Commentary
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
	UrlImage  string
	AboutMe   string
	UUID      string
}

type Data struct {
	Posts []Post
	Users []User
}

type Chat struct {
	Messages    []string `json:"messages"`
	Sender      string   `json:"sender"`
	MembersChat []string `json:"memberschat"`
}

type Commentary struct {
	Content string
	Author  User
	Post    Post
	Date    string
}
