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
import Link from "next/link";

let wssocket;
export default function page(){
    const [data, setData] = useState([])

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
    const [sub, setSub]=useState([])
    const [isFollowing, setIsFollowing] = useState(false);
    const [waitResponse, setWaitResponse]=useState("")
    const [usersWantFollowYou, setUsersWantFollowYou]=useState([])
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
    const [userIFollow, setUserIFollow]= useState([])

    useEffect(() => {
        const cookieUser = cookieExist()

        
        const urlParams = new URLSearchParams(window.location.search);
        const userParam = urlParams.get('user');
    
        // Déplacer le reste de la logique à l'intérieur de la fonction de rappel de setUser
        const fetchData = async () => {
            // Récupérer les données des posts
            const datafetch = await fetchDataHome();
            setData(datafetch);
            if (!datafetch.Users){
                 window.location.href="/"
            }
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
                setSub(dataReceved.userProfil.PeopleWhoFollowMe)
                if (dataReceved.userProfil.PeopleWhoFollowMe.some((userSub) => userSub.Nickname === userName)){
                    setIsFollowing(true);
                }
            }     
            if (dataReceved.privateSub){
                setWaitResponse("Wait for a response of profil")
            }

            if (dataReceved.userProfil.PrivateSub){
                setUsersWantFollowYou(dataReceved.userProfil.PrivateSub)
            }

            if (dataReceved.userProfil.PeopleIFollow){
                setUserIFollow(dataReceved.userProfil.PeopleIFollow)
                console.log(dataReceved.userProfil.PeopleIFollow)
            }

        }
    
        // Appeler la fonction qui effectue le fetch et la gestion du WebSocket
        fetchData();
    
        wssocket = openWebSocketConnexion();
    
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

            }else if (response.action ==="Wait for a response of profil"){
                setIsFollowing(false)
                setWaitResponse(response.action )
            }else if (response.action === "cancel request private profil"){
                setIsFollowing(false)
                setWaitResponse("")
            }else {
                setNewFollow(nbrSub-1)
                setIsFollowing(false)
            }
        }
      };

      const setUsertoParam = (key, value) => {
        setUserInfo({
            ...userInfo,
            [key]: value,
        });
    
        if (key === "Nickname") {
            // Utilisation des backticks pour la template string
            console.log(`ici problème: ${value}`);
    
            // Mise à jour de l'objet avec la nouvelle valeur de Nickname
            setUser((previousUser) => ({
                ...previousUser, // Conserve les anciennes propriétés
                Nickname: value, // Met à jour ou ajoute la clé Nickname
            }));
        }
    };
    

    const acceptFollow = async (name)=>{
        const formFollow = new FormData();
        formFollow.append("token", cookieExist());
        formFollow.append("nature", "accept follow");
        formFollow.append("userProfil", name)
        const response = await sendAndReceiveData("/api/follow", formFollow);
        console.log("réponse serveur:",response)
        if (response.Accept){
            setUsersWantFollowYou(usersWantFollowYou.filter((previous)=> previous.Nickname !== response.action))
            setNewFollow(nbrSub+1)
        }
    }

    const refuseFollow = async (name)=>{
        const formFollow = new FormData();
        formFollow.append("token", cookieExist());
        formFollow.append("nature", "refuse follow");
        formFollow.append("userProfil", name)
        const response = await sendAndReceiveData("/api/follow", formFollow);
        console.log("réponse serveur:",response)
        if (response.Accept){
            setUsersWantFollowYou(usersWantFollowYou.filter((previous)=> previous.Nickname !== response.action))
        }
    }

    const [seeSub, setSeeSub] = useState(false)
    const handleSeeSub=()=>{
        setSeeSub(!seeSub)
    }

    const goToProfilSub =(nickname)=>{
        window.location.href=`/profil?user=${nickname}`
    }

    const [seeSubscription, setSeeSunscriptions] = useState(false)
    const seeSubscriptions=()=>{
        setSeeSunscriptions(!seeSubscription)
    }


    onMessageWS()

    return(
        <div>
            <div className={styles.background}>
                
                {userInfo.Nickname != "" && !isLoading ? 
                <>
                    {data.Events && wssocket!= null ?<DashboardTop events={data.Events} ws={wssocket} setData={setData} userComplete={user}/> : <DashboardTop ws={wssocket} setData={data} userComplete={user} />}
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
                       
                        {usersWantFollowYou.length > 0 ? (
                            <div className={styles.requestContainer}>
                                <>
                                    <div className={styles.requestHeader}>Subscription Requests:</div>
                                    {usersWantFollowYou.map((notification, index) => (
                                        <div key={index} className={styles.followRequest}>
                                            <div className={styles.requestInfo}>
                                                <span className={styles.requestText}>User {notification.Nickname} wants to follow you.</span>
                                                <button className={styles.acceptButton} onClick={() => acceptFollow(notification.Nickname)}>Accept</button>
                                                <button className={styles.refuseButton} onClick={() => refuseFollow(notification.Nickname)}>Refuse</button>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            </div>
                        ) : (
                            null
                        )}
                        <div className={styles.publicPart}>
                        <img className={styles.avatar} src={`${userInfo.UrlImage}`} alt="Avatar" />
                        <div className={styles.nickname}>
                            {userInfo.Nickname}
                        </div>
                        {user.Nickname !== userInfo.Nickname && (
                            <button className={styles.followButton} onClick={handleFollow}>
                            {waitResponse ? (
                                    "Please wait for a response..."
                                ) : (
                                    isFollowing ? "Unsubscribe" : "Subscribe"
                                )}
                            </button>
                        )}
                        {(isFollowing || userInfo.Profil === "public" || user.Nickname === userInfo.Nickname) && ( // Afficher les informations utilisateur uniquement si l'utilisa
                            <>
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
                                {userIFollow && userIFollow.length>0 &&(
                                    <div className={styles.subscribersContainer}>
                                        <div className={styles.subscribersTitle}>Subscriptions</div>
                                        <div className={styles.subscriberList}>
                                            {seeSubscription && userIFollow.map((subscriber, index) => (
                                            <div key={index} className={styles.subscriberItem}>
                                                <img
                                                src={subscriber.UrlImage}
                                                alt={`Avatar de ${subscriber.Nickname}`}
                                                className={styles.subscriberAvatar}
                                                />
                                                <Link href={`/profil?user=${subscriber.Nickname}`} className={styles.subscriberName} onClick={() => goToProfilSub(subscriber.Nickname)}>
                                                    {subscriber.Nickname}
                                                </Link>
                                            </div>
                                            ))}
                                        </div>
                                        <button onClick={seeSubscriptions} className={styles.seeSubButton}>
                                            {seeSubscription ? 'Hide Subscriptions' : 'See Subscriptions'}
                                        </button>
                                    </div>
                                )}
                                {nbrSub > 0 && (
                                    <div className={styles.subscribersContainer}>
                                        <>
                                        <div className={styles.subscribersTitle}>Subscribers</div>
                                        <div className={styles.subscriberList}>
                                            {seeSub &&
                                            sub.map((subscriber, index) => (
                                                <div key={index} className={styles.subscriberItem}>
                                                <img
                                                    src={subscriber.UrlImage}
                                                    alt={`Avatar de ${subscriber.Nickname}`}
                                                    className={styles.subscriberAvatar}
                                                />
                                                <Link href={`/profil?user=${subscriber.Nickname}`} className={styles.subscriberName} onClick={()=>goToProfilSub(subscriber.Nickname)}>
                                                    {subscriber.Nickname}
                                                </Link>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={handleSeeSub} className={styles.seeSubButton}>
                                            {seeSub ? 'Hide Subscribers' : 'See Subscribers'}
                                        </button>
                                        </>
                                    </div>
                                )}
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
                            </>
                        )}
                    </div>
                </div>
                </>
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