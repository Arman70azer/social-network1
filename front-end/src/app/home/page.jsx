"use client"
import DashboardTop from "../components/dashboard";
import DashboardBottom from "../components/dashboard2"
import WebSocket from "../components/home_webSocket"
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
            console.log("ggg")
        };

        // Appeler la fonction qui effectue à la fois le fetch et la gestion du WebSocket
        WebSocket("home", "Martin", "look", "Salut")
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
            <div>
        </div>
                {posts.map((post, index) => (
                    <div key={index} className={styles.windowPost} id={`postBy${post.Author}`}>
                        <div className={styles.alineProfilPost}>
                            <div className={styles.avatarProfil}>
                                <img className={styles.avatarPost} src={`/images/${post.Author.ImageName}`}/>
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
                                <img className={styles.imagePost} src={`/images/${post.Image}`}/>
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