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
	Likes          []LikeOrDislike
	Dislikes       []LikeOrDislike
	EventDate      string
	Followers      []string
	NoFollowers    []string
	Error          string
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
	Followers []Followers
}

type Data struct {
	Posts  []Post `json:"Posts"`
	Users  []User `json:"Users"`
	Events []Post `json:"Events"`
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

type Request struct {
	Origin           string `json:"Origin"`
	Nature           string `json:"Nature"`
	User             string `json:"User"`
	ObjectOfRequest  string `json:"ObjectOfRequest"`
	Post             string `json:"Post"`
	Accept           bool   `json:"Accept"`
	Date             string `json:"Date"`
	OtherLikeDislike bool   `json:"OtherLikeDislike"`
	Event            string `json:"Event"`
}

type LikeOrDislike struct {
	Type string
	User string
	Post string
	Date string
}

type Migrations struct {
	Name    string
	Type    string
	Request string
	ID      string
}

type Followers struct {
	ID        int
	Following string
	Follower  string
}
