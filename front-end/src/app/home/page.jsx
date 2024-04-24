"use client"
import DashboardTop from "../components/dashboard";
import DashboardBottom from "../components/dashboard2"
import giveMessageWebsocket from "../lib/websocket"
import fetchPosts from "../lib/fetPosts";
import styles from '../styles/home.module.css'
import { useEffect, useState } from 'react';

export default function Page(){
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            // Récupérer les données des posts
            const postsData = await fetchPosts();
            setPosts(postsData);
        };

        // Appeler la fonction qui effectue le fetch et la gestion du WebSocket
        //giveMessageWebsocket("home", "Martin", "eee", "Salut")
        fetchData();
    }, []);
    console.log(posts);
    //post.map va parcourir tout les posts dans "posts" et les afficher
    return (
        <div>
            <DashboardTop/>
            <div className={styles.centerElementChilds}>
                <button className={styles.actualiserPosts}>Actualiser</button>
            </div>
            <div className={styles.Content}>
                {posts.map((post, index) => (
                    <div key={index} className={styles.windowPost} id={`postBy${post.Author}`}>
                        <div className={styles.alineProfilPost}>
                            <div className={styles.avatarProfil}>
                                <img className={styles.avatarPost} src={`${post.Author.UrlImage}`} alt="Avatar" />
                            </div>
                            <button className={styles.authorPost}>
                                {post.Author.Nickname}
                            </button>
                        </div>
                        <div className={styles.postContent}>
                            <div className={styles.titlePost}>
                                {post.Titre}:
                            </div>
                            <div className={styles.imagePostContainer}>
                                <img className={styles.imagePost} src={`${post.UrlImage}`}/>
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
            <DashboardBottom/>
        </div>
    );
}