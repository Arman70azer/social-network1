"use client"
import DashboardTop from "../components/dashboard";
import openWebSocketConnexion from "../lib/websocket"
import fetchUsersAndPosts from "../lib/fetPosts";
import styles from '../styles/home.module.css'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import sendFormToHome from '../lib/sendFormToHome'
import sendRequestToWebsocket from '../lib/wsSendMessage'

let wsConnect;//Notre ws est stocké ici
export default function Page(){
    const [data, setData] = useState([]);
    const [allData, setAllData]=useState([])
    const [seeThisPostCommentaries, setCommentaries] = useState("")
    const [enterComment, setEnterComment] = useState("")

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
                if (allData.Posts[i].Type === "Private") {
                    newData.push(allData.Posts[i]);
                }
            }
            setData((prevState) => ({ ...prevState, Posts: newData }));
        }
    };
    
    useEffect(() => {
       
        const fetchData = async () => {
            // Récupérer les données des posts
            const datafetch = await fetchUsersAndPosts();
            setData(datafetch);
            setAllData(datafetch)
        };

        // Appeler la fonction qui effectue le fetch et la gestion du WebSocket
        fetchData();
        if (!wsConnect){
            const ws = new WebSocket('ws://localhost:8000/websocket');
            wsConnect = openWebSocketConnexion(ws)
            setTimeout(() => {
                sendRequestToWebsocket(wsConnect, { Origin: "home", Nature: "enterToHome", User:"Arman" });
            }, 200);
        }

    }, []);

    const seeCommentaries = (postName)=>{
        if (seeThisPostCommentaries!="" && seeThisPostCommentaries===postName){
            setCommentaries("")
        }else{
            setCommentaries(postName)
        }
    }

    const submitCommentary = (event)=>{
        if (event.key === 'Enter') {
            console.log("enter")
            setEnterComment("")

            //Envoie du commentaire dans le back
            if (enterComment!="" && seeThisPostCommentaries!=""){
                const formNewCommentary = new FormData();
                formNewCommentary.append("author", "Arman")
                formNewCommentary.append("post", seeThisPostCommentaries)
                formNewCommentary.append("content", enterComment)
                formNewCommentary.append("origin", "home")
                formNewCommentary.append("nature", "comment")

                sendFormToHome(formNewCommentary)
                
                sendRequestToWebsocket(wsConnect, { Origin: "home", Nature: "newComment", User:"Arman", ObjetcOfRequest: seeThisPostCommentaries });
            }
        }
    }

    //Cette function va push dans data les ajouts de commentaires et autres... dans la base de données 
    //qui ont été valider par celle-ci  
    const onMessageWS = () => {
        if (data && wsConnect) {
            // Gérer les messages reçus du serveur WebSocket
            wsConnect.onmessage = (event) => {
                const receivedMessage = JSON.parse(event.data); // Convertir la chaîne JSON en objet JavaScript
                if (receivedMessage.Accept) {
                    console.log("Message reçu du serveur WebSocket:", receivedMessage);
                    console.log(data, "hhhhhhh")
                    if (data.Posts) {
                        // Filtrer les posts pour trouver celui qui correspond au post reçu
                        const postTarget = data.Posts.find((post) => post.Titre === receivedMessage.Post);
                        if (postTarget) {
                            // Ajouter un nouveau commentaire au post cible
                            postTarget.Commentaries.push({
                                Content: receivedMessage.ObjectOfRequest,
                                Author: { Nickname: receivedMessage.User },
                                Post: { Titre: receivedMessage.Post },
                                Date: receivedMessage.Date
                            });
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
                        } else {
                            console.log("Aucune donnée des posts trouvée.");
                        }
                    }
                }
            };
        }
    };
    
    onMessageWS()
    //post.map va parcourir tout les posts dans "posts" et les afficher
    return (
        <div>
            <DashboardTop/>
            <div className={styles.centerElementChilds}>
                <button className={styles.actualiserPosts}>Actualiser</button>
            </div>
            <div className={styles.Content}>
                {data.Posts && data.Posts.map((post, index) => (
                    <div key={index} className={styles.windowPost} id={`postBy${post.Author}`}>
                        <div className={styles.alineProfilPost}>
                            <div className={styles.avatarProfil}>
                                <img className={styles.avatarPost} src={`${post.Author.UrlImage}`} alt="Avatar" />
                            </div>
                            <button className={styles.authorPost}>
                                {post.Author.Nickname}
                            </button>
                            <div className={styles.typePost}>
                                {post.Type} Post
                            </div>
                        </div>
                        <div className={styles.postContent}>
                            <div className={styles.titlePost}>
                                {post.Titre}:
                            </div>
                            <div className={styles.imagePostContainer}>
                               {post.ImageName&& <img className={styles.imagePost} src={`${post.UrlImage}`}/>}
                            </div>
                            <div className={styles.contentPost}>
                                {post.Content}
                            </div>
                        </div>
                        <div className={styles.postFooter}>
                            <div className={styles.buttonLike}>
                                <button>Like</button>
                            </div>
                            <div className={styles.buttonDislike}>
                                <button className={styles.marginLeft}>Dislike</button>
                            </div>
                            <div className={styles.commentaires}>
                            <button onClick={() => seeCommentaries(post.Titre)}>
                                {post.Commentaries ? `See commentaries (${post.Commentaries.length})` : "See commentaries"}
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
                                </div>

                                {post.Commentaries && post.Commentaries.map((comment, index)=>(
                                    <div className={styles.commentsContent} key={index}>
                                         <Link href={`/profil/`+comment.Author.Nickname}>{comment.Author.Nickname}: </Link>
                                         {comment.Content}
                                    </div>
                                ))
                                }
                            </div>
                        }
                    </div>
                ))}
            </div>
            <div className={styles.dashboardBottomPage}>
                <Link href="/createPost" className={styles.buttonCreatePost}>Create New Post [+]</Link>
                <button className={styles.buttonPostPublic} onClick={onlyPublicPosts} >Publics Posts</button>
                <button className={styles.buttonPostPrivates} onClick={onlyPrivatePosts}>Privates Posts</button>
                <button className={styles.buttonPostsAll} onClick={resetDataToOrigine}> All Posts </button>
            </div>
        </div>
    );
}