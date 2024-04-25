"use client"
import DashboardTop from "../components/dashboard";
import giveMessageWebsocket from "../lib/websocket"
import fetchUsersAndPosts from "../lib/fetPosts";
import styles from '../styles/home.module.css'
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Page(){
    const [data, setData] = useState([]);
    const [allData, setAllData]=useState([])

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
        //giveMessageWebsocket("home", "Martin", "eee", "Salut")
        fetchData();
    }, []);
    console.log(data);
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
                                <button>See commentaries</button>
                            </div>
                            <div className={styles.datePost}>
                                {post.Date}
                            </div>
                        </div>
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