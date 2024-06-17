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
	ID               int
	Nickname         string
	Email            string
	Password         string
	FirstName        string
	LastName         string
	Birthday         string
	Age              int
	ImageName        string
	UrlImage         string
	AboutMe          string
	UUID             string
	Subscriber       []User
	WantBeSubscriber []User
	Profil           string
}

type Data struct {
	Posts  []Post `json:"Posts"`
	Users  []User `json:"Users"`
	Events []Post `json:"Events"`
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
	Tchat            Tchat  `json:"Tchat"`
	ToUser           string `json:"ToUser"`
	Message          string `json:"Message"`
	Users            []User `json:"Users"`
	Name             string `json:"Name"`
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

type Follow struct {
	PeopleIFollow            []User
	PeopleWhoFollowMe        []User
	PeopleIFollowAndFollowMe []User
}

type PrivatesViewer struct {
	ID       int
	Author   int
	Viewer   int
	Post     int
	Follow   bool
	NoFollow bool
}

type Tchat struct {
	ClientsConnect []User `json:"ClientsConnect"`
	Clients        []User `json:"Clients"`
	Messages       []Message
	AuthorNotSee   []string
	Group          []Group
}

type Group struct {
	Name    string
	Members []User
	Conv    []Message
}

type Message struct {
	ID        int    `json:"ID"`
	Author    string `json:"Author"`
	Recipient string `json:"Recipient"`
	Content   string `json:"Content"`
	Date      string `json:"Date"`
	Groupe    string `json:"Groupe"`
	See       bool   `json:"See"`
}
