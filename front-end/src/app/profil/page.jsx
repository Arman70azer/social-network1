"use client"
import { useEffect, useState } from "react";
import DashboardTop from "../components/dashboard";
import fetchDataHome from "../lib/fetchDataHome";
import openWebSocketConnexion from "../lib/websocket"
import styles from "../styles/profil.module.css"
import eventUpdate from "../utils/eventUpdate"
import cookieExist from "../utils/cookieUserExist";
import sendAndReceiveData from "../lib/sendForm&ReceiveData"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import SettingsProfil from "../components/settingsProfil"

let wssocket;
export default function page(){
    const [data, setData] = useState([])
    const [user, setUser] = useState({
        token: "",
        name:"",
    })
    const [isLoading, setLoading] = useState(true)
    const [userInfo, setUserInfo] = useState({
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
    })
    const [settings, setSettings]= useState(false)
    const [postsUser, setPostsUser] = useState([])
    const [isFollowing, setIsFollow] = useState(false)

    useEffect(() => {
        const cookieUser = cookieExist()

        
        const urlParams = new URLSearchParams(window.location.search);
        const userParam = urlParams.get('user');
    
        // Déplacer le reste de la logique à l'intérieur de la fonction de rappel de setUser
        const fetchData = async () => {
            // Récupérer les données des posts
            const datafetch = await fetchDataHome();
            setData(datafetch);
            setUserInfo(datafetch.Users.filter((client) => client.Nickname === userParam)[0]);

            const form = new FormData
            form.append("token", cookieUser)
            const userInfo1 = await sendAndReceiveData("/api/profil", form)
            setUser({ 
                name: userInfo1.Users[0].Nickname, 
                token: cookieUser 
            });

            console.log(user)
            if (datafetch.Posts){
                setPostsUser(datafetch.Posts.filter((post) => post.Author.Nickname === userParam));
            }
        };
        
    
        // Appeler la fonction qui effectue le fetch et la gestion du WebSocket
        fetchData();
    
        wssocket = openWebSocketConnexion(userParam);
    
        setTimeout(() => {
            setLoading(false);
        }, 500);
    }, []);
    

    const onMessageWS = () => {
        if (data && wssocket!= null) {
            // Gérer les messages reçus du serveur WebSocket
            wssocket.onmessage = (event) => {
                const receivedMessage = JSON.parse(event.data); 
                if (receivedMessage.Accept && receivedMessage.Event){
                    const eventTarget = eventUpdate(data.Events, receivedMessage)
                    setData(prevData => {
                        const updateEvents = prevData.Events.map(event => {
                            if (event.Titre === eventTarget.Titre) {
                                return eventTarget;
                            } else {
                                return event;
                            }
                        });
                        return { ...prevData, Events: updateEvents };
                    });
                    console.log(data.Events[0].Followers)
                }
            }
        }
    }

    const handleSettingsClick = () => {
        setSettings(!settings);
    };

    const setUsertoParam = (key, value)=>{
        setUserInfo({
            ...userInfo,
            [key]:value
        })
        if (key == "Nickname"){
            setUser({
                name: value
            })
        }
    }

    onMessageWS()

    return(
        <div>
            {data.Events && wssocket!= null ? <DashboardTop events={data.Events} ws={wssocket} /> : <DashboardTop />}
            <div className={styles.background}>
                {userInfo.Nickname != "" && !isLoading ? 
                <div className={styles.Content}>
                    {user.name === userInfo.Nickname && (
                        <>
                            <div className={styles.settings}>
                                <button className={styles.settingsButton} onClick={handleSettingsClick}>
                                    <FontAwesomeIcon icon={faCog} className={styles.settingsIcon} />
                                </button>
                            </div>
                            {settings && (
                                <SettingsProfil onClose={handleSettingsClick} user={userInfo} setUser={setUsertoParam} />
                            )}
                        </>
                    )}
                    <div className={styles.publicPart}>
                    <img className={styles.avatar} src={`${userInfo.UrlImage}`} alt="Avatar" />
                    <div className={styles.nickname}>
                        {userInfo.Nickname}
                    </div>
                    {user.name !== userInfo.Nickname && (
                        <button className={styles.followButton}>
                            {isFollowing ? "Abonné" : "S'abonner"}
                        </button>
                    )}
                    <div className={styles.statProfil}>
                        <span>
                            <i className="fas fa-birthday-cake"></i>
                            Age: {userInfo.Age} years
                        </span>
                        <span>
                            <i className="fas fa-calendar-alt"></i>
                            Birthday:  {userInfo.Birthday}
                        </span>
                        <span>
                            <i className="fas fa-foolowers"></i>
                            Number of followers: {userInfo.Followers && userInfo.Followers.length > 0 ? userInfo.Followers.length : 0}
                        </span>
                        <span>
                            <i className="fas fa-posts"></i>
                            Number of posts: {postsUser && postsUser.length > 0 ? postsUser.length : 0}
                        </span>
                    </div>
                    <div>Bio:</div>
                    <div className={styles.bio}>
                        {userInfo.AboutMe ? userInfo.AboutMe : "Give some information about you!!!"}
                    </div>
                    <div>Post:</div>
                
                    <div>
                        {postsUser && postsUser.length > 0 ? (
                            postsUser.map((post, index) => (
                                <div className={styles.post_details} key={index}>
                                    <div className={styles.post_date}>
                                        From {post.Date.split(" ")[0]} to {post.Date.split(" ")[1]}
                                    </div>
                                    {post.ImageName && 
                                    (<img src={post.UrlImage} className={styles.post_image}></img>)
                                    }
                                    <div className={styles.post_content}>
                                        {post.Content}
                                    </div>
                                    <div className={styles.likeDislike}>
                                        Like: {post.Likes && post.Likes.length>0 ? post.Likes.length : 0} Dislike:  {post.Dislikes && post.Dislikes.length>0 ? post.Dislikes.length : 0}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.no_posts}>aucun post</div>
                        )}
                    </div>
                </div>
            </div>
            :
            <div className={styles.overlay}>
                <div className={styles.loader}></div>
                <p>Load of profile data...</p>
            </div>
            }
        </div>
        </div>
    )
}