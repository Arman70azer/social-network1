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
import Tchat from "../components/tchat";

let wssocket;
export default function page(){
    const [data, setData] = useState([])
    const [seeTchat, setTchat]=useState(false)
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
    })
    const [nbrSub, setNewFollow]= useState(0)
    const [isFollowing, setIsFollowing] = useState(false);
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

    useEffect(() => {
        const cookieUser = cookieExist()

        
        const urlParams = new URLSearchParams(window.location.search);
        const userParam = urlParams.get('user');
    
        // Déplacer le reste de la logique à l'intérieur de la fonction de rappel de setUser
        const fetchData = async () => {
            // Récupérer les données des posts
            const datafetch = await fetchDataHome();
            setData(datafetch);
            const userProfil =datafetch.Users.filter((client) => client.Nickname === userParam)[0]
            setUserInfo(userProfil);

            const form = new FormData
            form.append("token", cookieUser)
            const userInfo1 = await sendAndReceiveData("/api/profil", form)
            setUser(userInfo1.Users[0]);

            if (datafetch.Posts){
                setPostsUser(datafetch.Posts.filter((post) => post.Author.Nickname === userParam));
            }

            await fetchFollow(userProfil, userInfo1.Users[0].Nickname);
        };
        const fetchFollow = async (userProfil, userName) =>{
            const formData = new FormData
            formData.append("token", cookieUser)
            formData.append("userProfil", userProfil.Nickname)
            const dataReceved = await sendAndReceiveData("/api/follow", formData)

            if (dataReceved.userProfil.PeopleWhoFollowMe){
                setNewFollow(dataReceved.userProfil.PeopleWhoFollowMe.length)
                if (dataReceved.userProfil.PeopleWhoFollowMe.some((userSub) => userSub.Nickname === userName)){
                    setIsFollowing(true);
                }
            }     
        }
    
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

    const handleFollow = async () => {
        const formFollow = new FormData();
        formFollow.append("token", cookieExist());
        formFollow.append("userProfil", userInfo.Nickname);
        formFollow.append("nature", "follow");
        const response = await sendAndReceiveData("/api/follow", formFollow);
        console.log(response)
        if (response.Accept) {
            if (response.action === "You're now subscribe") {
                setNewFollow(nbrSub+1)
                setIsFollowing(true)
        
            }else {
                setNewFollow(nbrSub-1)
                setIsFollowing(false)
            }
        }
    };

    const setUsertoParam = (key, value)=>{
        setUserInfo({
            ...userInfo,
            [key]:value
        })
        if (key == "Nickname"){
            setUser((previousUser) => {
                return [...previousUser, { Nickname: value }];
            });
        }
    }

    function handleTchat(){
        setTchat(!seeTchat)
    }

    onMessageWS()

    return(
        <div>
            {data.Events && wssocket!= null ?<DashboardTop events={data.Events} ws={wssocket} handleTchat={handleTchat} setData={setData}/> : <DashboardTop  ws={wssocket}  handleTchat={handleTchat}/>}
            {seeTchat && user && (<Tchat onClose={handleTchat} ws={wssocket} user={user}/>)}
            <div className={styles.background}>
                {userInfo.Nickname != "" && !isLoading ? 
                <div className={styles.Content}>
                    {user.Nickname === userInfo.Nickname && (
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
                    {user.Nickname !== userInfo.Nickname && (
                        <button className={styles.followButton} onClick={handleFollow}>
                            {isFollowing ? "Unsubscribe" : "Subscribe"}
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
                            Number of followers: {nbrSub}
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