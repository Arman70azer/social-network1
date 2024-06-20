"use client"
import DashboardTop from "../components/dashboard";
import openWebSocketConnexion from "../lib/websocket"
import fetchUsersAndPosts from "../lib/fetchDataHome";
import styles from '../styles/home.module.css'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import sendFormToBack from '../lib/sendFormToBack'
import cookieExist from '../utils/cookieUserExist'
import sendAndReceiveData from "../lib/sendForm&ReceiveData"

let wssocket;
export default function Page(){
    const [data, setData] = useState([]);
    const [allData, setAllData]=useState([])
    const [seeThisPostCommentaries, setCommentaries] = useState("")
    const [enterComment, setEnterComment] = useState("")
    const [newPosts, setNewPosts] = useState([])
    const [groups, setGroups] = useState([])
    const [selectValue, setSelectValue] = useState("")
    const [user, setUser] = useState({
        ID:0,
        Nickname:"",
        Email: "",
        Password:"",
        FirstName: "",
        LastName: "",
        Birthday: "",
        Age: 0,
        ImageName: "",
        UrlImage: "",
        AboutMe: "",
        UUID: "",
    })
    const [isLoading, setLoading]=useState(true)

    const onlyPublicPosts = () => {
        if (data.Posts) {
            let newData = [];
            for (let i = 0; i < allData.Posts.length; i++) {
                if (allData.Posts[i].Type === "Public") {
                    newData.push(allData.Posts[i]);
                }
            }
            setData((prevState) => ({ ...prevState, Posts: newData }));
        }
    }; 

    const resetDataToOrigine = ()=>{
        setData(allData)
    }
    
    const onlyPrivatePosts = () =>{
        if (data.Posts) {
            let newData = [];
            for (let i = 0; i < allData.Posts.length; i++) {
                if (allData.Posts[i].Type === "Private" || allData.Posts[i].Type === "Private++") {
                    newData.push(allData.Posts[i]);
                }
            }
            setData((prevState) => ({ ...prevState, Posts: newData }));
        }
    };

    const onlyGroupPosts = () =>{
        if (data.Posts) {
            let newData = [];
            for (let i = 0; i < allData.Posts.length; i++) {
                if (allData.Posts[i].Type !== "Private" && allData.Posts[i].Type !== "Private++" && allData.Posts[i].Type !== "Public") {
                    if (selectValue){
                        if (selectValue === allData.Posts[i].Type){
                            newData.push(allData.Posts[i]);
                        }
                    }else{
                        newData.push(allData.Posts[i]);
                    }
                }
            }
            setData((prevState) => ({ ...prevState, Posts: newData }));
        }
    }
    
    useEffect(() => {

        const userCookie = cookieExist()
       
        const fetchData = async () => {
            // Récupérer les données des posts
            const datafetch = await fetchUsersAndPosts();
            setData(datafetch);
            setAllData(datafetch)
        };

        const fetchUserInfo = async () => {
            const formToken = new FormData
            formToken.append("token", userCookie)
        
            const data = await sendAndReceiveData("/api/profil", formToken);

            setUser(data.Users[0])
            setGroups(data.Groups)

        }

        wssocket = openWebSocketConnexion();

        // Appeler la fonction qui effectue le fetch et la gestion du WebSocket
        fetchUserInfo()
        fetchData();

        setTimeout(()=>{
            setLoading(false)
        }, 500)
    }, []);
       
    const seeCommentaries = (postName)=>{
        if (seeThisPostCommentaries!="" && seeThisPostCommentaries===postName){
            setCommentaries("")
        }else{
            setCommentaries(postName)
        }
    }

    const submitCommentary = async (event)=>{
        if (event.key === 'Enter') {
            console.log("enter")
            setEnterComment("")

            //Envoie du commentaire dans le back
            if (enterComment!="" && seeThisPostCommentaries!=""){
                const formNewCommentary = new FormData();
                formNewCommentary.append("token", user.UUID)
                formNewCommentary.append("post", seeThisPostCommentaries)
                formNewCommentary.append("content", enterComment)
                formNewCommentary.append("origin", "home")
                formNewCommentary.append("nature", "comment")
                if (file && fileValid){
                    formNewCommentary.append("file", file)
                }
                const receivedMessage = await sendAndReceiveData("/api/home", formNewCommentary)
                whatToDo(receivedMessage)
                
            }
        }
    }

    //Cette function va push dans data les ajouts de commentaires et autres... dans la base de données 
    //qui ont été valider par celle-ci  
    const whatToDo = (receivedMessage) => {
        if (receivedMessage.Accept && receivedMessage.Post) {

            console.log("Message reçu du serveur WebSocket:", receivedMessage);
            // Filtrer les posts pour trouver celui qui correspond au post reçu
            let postTarget;
            if (data.Posts){
                postTarget = data.Posts.find((post) => post.Titre === receivedMessage.Post);
            }
            if (postTarget) {
                if (receivedMessage.Nature === "New-comment" ) {
                    if (!postTarget.Commentaries) {
                        // Si Commentaires n'existe pas, le créer comme un tableau vide
                        postTarget.Commentaries = [];
                    }
                    console.log(receivedMessage.Image)
                    // Ajouter un nouveau commentaire au post cible
                    postTarget.Commentaries.push({
                        Content: receivedMessage.ObjectOfRequest,
                        Author: { Nickname: receivedMessage.User },
                        Post: { Titre: receivedMessage.Post },
                        Date: receivedMessage.Date,
                        UrlImage: receivedMessage.image
                    });
                }
                if (receivedMessage.Nature==="New-like"){
                    if (!postTarget.Likes) {
                        // Si Likes n'existe pas, le créer comme un tableau vide
                        postTarget.Likes = [];
                    }
                    if (receivedMessage.ObjectOfRequest === "add") {
                        // Ajouter un like à postTarget.Likes
                        postTarget.Likes.push({
                            Type: "like",
                            User: receivedMessage.User,
                            Post: receivedMessage.Post
                        });
                    
                        // Si receivedMessage.OtherLikeDislike est vrai, supprimer les dislikes de l'utilisateur spécifié
                        if (receivedMessage.OtherLikeDislike) {
                            postTarget.Dislikes = postTarget.Dislikes.filter(dislikePost => dislikePost.User !== receivedMessage.User);
                        }
                    
                    } else if (receivedMessage.ObjectOfRequest === "remove") {
                        postTarget.Likes = postTarget.Likes.filter(like => like.User !== receivedMessage.User);
                    }                            
                }else if (receivedMessage.Nature ==="New-dislike"){
                    if (!postTarget.Dislikes) {
                        // Si Dislikes n'existe pas, le créer comme un tableau vide
                        postTarget.Dislikes = [];
                    }
                    if (receivedMessage.ObjectOfRequest === "add") {
                        postTarget.Dislikes.push({
                            Type: "dislike",
                            User: receivedMessage.User,
                            Post: receivedMessage.Post
                        });
                        if (receivedMessage.OtherLikeDislike) {
                            postTarget.Likes = postTarget.Likes.filter(likePost => likePost.User !== receivedMessage.User);
                        }
                    } else if (receivedMessage.ObjectOfRequest === "remove") {
                        postTarget.Dislikes = postTarget.Dislikes.filter(like => like.User !== receivedMessage.User);
                    }                            
                }
                    // Mettre à jour toutes les données des posts avec le post modifié
                setAllData(prevData => {
                    const updatedPosts = prevData.Posts.map(post => {
                        if (post.Titre === postTarget.Titre) {
                            return postTarget;
                        } else {
                            return post;
                        }
                    });
                    return { ...prevData, Posts: updatedPosts };
                });
                setData(allData)
            }else if (receivedMessage.Nature === "New-post"){
                const newposty = {
                    Date : receivedMessage.Date,
                    User : receivedMessage.User,
                    Content : receivedMessage.Content
                }
                setNewPosts((prevState)=>[...prevState, newposty])
            } else {
                console.log("Aucune donnée des posts trouvée.");
            }
        }
    };

    const actualiserPage = async ()=>{
    
        const datafetch = await fetchUsersAndPosts();
        setData(datafetch);
        setAllData(datafetch)
        setNewPosts([])
    }

    const like = async (titrePost)=>{
        const formLikePost = new FormData();
        formLikePost.append("post", titrePost)
        formLikePost.append("token", user.UUID)
        formLikePost.append("nature", "like")
        formLikePost.append("origin", "home")

        const receivedMessage = await sendAndReceiveData("/api/home",formLikePost)
        whatToDo(receivedMessage)
    }

    const dislike = async (titrePost)=>{
        const formDislikePost = new FormData();
        formDislikePost.append("post", titrePost)
        formDislikePost.append("token", user.UUID)
        formDislikePost.append("nature", "dislike")
        formDislikePost.append("origin", "home")

        const receivedMessage = await sendAndReceiveData("/api/home",formDislikePost)
        whatToDo(receivedMessage)
    } 

    const [file, setFile] = useState(null);  // Utilisation d'un tableau pour gérer plusieurs fichiers
    const [fileValid, setFileValid] = useState(true);  // État pour vérifier si le fichier est valide

    const handleFile = (event) => {
        const fileImage = event.target.files[0]; // Obtenir le fichier

        // Vérifier le type de fichier
        if (fileImage) {
            const fileType = fileImage.type;
            if (fileType.startsWith('image/')) {
                setFileValid(true);
                setFile(fileImage); // Stocker le fichier dans le tablea
            } else {
                setFileValid(false);
            }
        }
    };

    const handleSelectChange = (e) => {
        setSelectValue(e.target.value);
        // Logique supplémentaire si nécessaire
    };

    //post.map va parcourir tout les posts dans "posts" et les afficher
    return (
        <div className={styles.background}>
            {data && !isLoading && wssocket? 
            <>
                {data.Events && wssocket!= null ? <DashboardTop events={data.Events} ws={wssocket} setAllData={setAllData} setData={setData} userComplete={user}/> : <DashboardTop ws={wssocket} setData={data} setAllData={allData} userComplete={user} />}
                <div className={styles.centerElementChilds}>
                    <button className={styles.actualiserPosts} onClick={actualiserPage}>
                        {newPosts && newPosts.length>0 ? `Actualiser(${newPosts.length})`: `Actualiser`}
                    </button>
                </div>
                {!wssocket && !isLoading && (<span style={{ color: 'red', display: "flex", alignItems: "center", justifyContent: "center" }}>You need to reload page to connect to server!!!</span>)}
                <div className={styles.Content}>
                    {data.Posts && data.Posts.map((post, index) => (
                        <div key={index} className={styles.windowPost} id={`postBy${post.Author}`}>
                            <div className={styles.alineProfilPost}>
                                <div className={styles.avatarProfil}>
                                    <img className={styles.avatarPost} src={`${post.Author.UrlImage}`} alt="Avatar" />
                                </div>
                                <Link href={{ pathname: "/profil", query: { user: post.Author.Nickname } }} className={styles.authorPost}>
                                    {post.Author.Nickname}
                                </Link>
                                <div className={styles.typePost}>
                                    {post.Type} Post
                                </div>
                            </div>
                            <div className={styles.postContent}>
                                <div className={styles.titlePost}>
                                    {post.Content}
                                </div>
                                {post.ImageName &&(
                                <div className={styles.imagePostContainer}>
                                <img className={styles.imagePost} src={`${post.UrlImage}`}/>
                                </div>)}
                            </div>
                            <div className={styles.postFooter}>
                                <div className={styles.buttonLike}>
                                    <button
                                        onClick={() => like(post.Titre)}
                                        style={{ color: post.Likes && post.Likes.some(likeOrDislike => likeOrDislike.User === user.Nickname) ? "blue" : "white" }}
                                    >
                                        {post.Likes && post.Likes.length> 0 ? `Like (${post.Likes.length})` : "Like"}
                                    </button>
                                </div>
                                <div className={styles.buttonDislike}>
                                    <button onClick={()=>dislike(post.Titre)} 
                                    className={styles.marginLeft}
                                    style={{ color: post.Dislikes && post.Dislikes.some(likeOrDislike => likeOrDislike.User === user.Nickname) ? "red" : "white" }}
                                    >
                                    {post.Dislikes && post.Dislikes.length > 0 ? `Dislikes (${post.Dislikes.length})` : "Dislikes"}
                                    </button>
                                </div>
                                <div className={styles.commentaires}>
                                <button onClick={() => seeCommentaries(post.Titre)}>
                                    {post.Commentaries && post.Commentaries.length>0 ? `See commentaries (${post.Commentaries.length})` : "See commentaries"}
                                </button>

                                </div>
                                <div className={styles.datePost}>
                                    {post.Date}
                                </div>
                            </div>
                            {seeThisPostCommentaries === post.Titre && 
                                <div className={styles.areaCommentary}>
                                    <div className={styles.inputComment}>
                                        <input type="text" placeholder="Add commentary" onKeyDown={(event) => submitCommentary(event)} 
                                        value={enterComment} 
                                        onChange={(event) => setEnterComment(event.target.value)} />

                                        <input type="file" className={styles.file} name="file" onChange={handleFile}/>
                                        {!fileValid && (<div className={styles.error}> File not valid </div>)}
                                    </div>

                                    {post.Commentaries && post.Commentaries.map((comment, index)=>(
                                        <div className={styles.commentsContent} key={index}>
                                            <Link href={{ pathname: "/profil", query: { user: post.Author.Nickname } }}>{comment.Author.Nickname}: </Link>
                                            {comment.Content}
                                            <div className={styles.dateComment}>{comment.Date}</div>
                                            {comment.UrlImage && <img className={styles.imagePost} src={`${comment.UrlImage}`}/>}
                                        </div>
                                    ))
                                    }
                                </div>
                            }
                        </div>
                    ))}
                </div>
                    <div className={styles.dashboardBottomPage}>
                    <button className={styles.buttonPostPublic} onClick={onlyPublicPosts} >Publics Posts</button>
                    <button className={styles.buttonPostPrivates} onClick={onlyPrivatePosts}>Privates Posts</button>
                    <button className={styles.buttonPostsAll} onClick={resetDataToOrigine}> All Posts </button>
                    {groups && groups.length >0 && (
                        <>
                            <button className={styles.buttonGroup} onClick={onlyGroupPosts}>
                                Group Posts {selectValue ? selectValue : 'All'}
                            </button>
                            <select className={styles.select} value={selectValue} onChange={handleSelectChange}>
                                <option value=""></option>
                                {groups.map((group, index) => (
                                        <option key={index} value={group.Name}>
                                            {group.Name}
                                        </option>
                                    ))}
                            </select>
                        </>
                    )}
                    <Link href="/createPost" className={styles.buttonCreatePost}>Add New Post or Event [+]</Link>
                </div>
            </>
             :
             <div>
                <div className={styles.overlay}>
                    <div className={styles.loader}></div>
                    <p>Load of profile data...</p>
                </div>
             </div>
             }
        </div>
    );
}