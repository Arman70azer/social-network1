import styles from '../styles/home.module.css'; // Utilisez des guillemets simples ou doubles pour l'importation
import Link from 'next/link';
import { useState, useEffect } from 'react';
import sendAndReceiveData from '../lib/sendForm&ReceiveData';
import cookieExist from '../utils/cookieUserExist';
import Cookies from "js-cookie"
import eventUpdate from '../utils/eventUpdate';
import Tchat from './tchat';
import sendMessageToWebsocket from '../lib/wsSendMessage';

//TODO Mettre les href une fois les pages finit !!!!!
let timout
function DashboardTop({ events = [], ws = null, setAllData, setData, userComplete}) {
    const origin= "home";

    const [showExtraButtons, setShowExtraButtons] = useState(false);
    const [showContentEvent, setShowContent] = useState({ index: null, show: false });
    const [seeTchat, setTchat]=useState(false)

    const [user, setUser] = useState("");
    const [userInfo, setUserInfo] = useState("")
    const [notifProfil, setNotifProfil]=useState([])
    const [inviationsGroup, setInvitationsGroup]=useState([])
    useEffect(() => {

        const userFromCookie= cookieExist()

        if (userFromCookie) {
            setUser(userFromCookie);
        }
        const fetchData = async () => {
            const formToken = new FormData
            formToken.append("token", userFromCookie)
        
            const data = await sendAndReceiveData("/api/profil", formToken);

            if (!data.Users[0].Nickname){
                window.location.href="/"
            }

            formToken.append("userProfil", userFromCookie)

            setUserInfo(data.Users[0].Nickname)   
            if (data.Tchat && data.Tchat.Invitations){
                setInvitationsGroup(data.Tchat.Invitations)
            }
            console.log("ici regarde:",data)

            const data2 = await sendAndReceiveData("/api/follow", formToken);
            setNotifProfil(data2.userProfil.PrivateSub)
        }
        const notific= async ()=>{
            const request = {
                User: cookieExist(),
                Origin: "chat-home",
                Nature: "chat",
                ObjectOfRequest: "notifications"
            };
            sendMessageToWebsocket(ws, request)
        }
        fetchData()
        notific()
    }, []);

    const logout = () => {
        // Supprimer les cookies de l'utilisateur
        Cookies.remove("token");
        // Rediriger vers la page d'accueil
        window.location.href = '/'
    };

    const handleMouseEnter = () => {
        setShowExtraButtons(true);
    };

    const handleMouseLeave = () => {
        setShowExtraButtons(false);
    };

    const handleEventContent = (index) => {
        if (index == showContentEvent.index){
            setShowContent({index:null, show: false })
        }else{
            setShowContent({ index, show: true });
        }
    };

    const handleEventYes= async (titre)=>{
        if (ws != null){
            const formEventPost = new FormData();
            formEventPost.append("event", titre)
            formEventPost.append("token", user)
            formEventPost.append("nature", "yes")
            formEventPost.append("origin", origin)

            const receivedMessage = await sendAndReceiveData("/api/home",formEventPost)

            setEvents(receivedMessage)
        }
    }
    const setEvents=(receivedMessage)=>{
        if (receivedMessage.Accept && receivedMessage.Event){
            const eventTarget = eventUpdate(events, receivedMessage)
            if (setAllData){
                setAllData(prevData => {
                    const updateEvents = prevData.Events.map(event => {
                        if (event.Titre === eventTarget.Titre) {
                            return eventTarget;
                        } else {
                            return event;
                        }
                    });
                    return { ...prevData, Events: updateEvents };
                });
            }
            setData(prevData => {
                const updateEvents = prevData.Events.map(event => {
                    if (event.Titre === eventTarget.Titre) {
                        return eventTarget;
                    } else {
                        return event;
                    }
                });
                return { ...prevData, Events: updateEvents };
            })
        }
    }
    const handleEventNo= async (titre)=>{
        if (ws != null){
            const formEventPost = new FormData();
            formEventPost.append("event", titre)
            formEventPost.append("token", user)
            formEventPost.append("nature", "no")
            formEventPost.append("origin", origin)

            const receivedMessage = await sendAndReceiveData("/api/home",formEventPost)

            setEvents(receivedMessage)
        }
    }

    const redirection = ()=>{
        window.location.href= "/profil?user="+userInfo
    }

    function handleTchat(){
        setTchat(!seeTchat)
    }

    const [notification, setNotification] = useState([]);

    function setNotif(nickname, supp) {
        if (supp) {
            setNotification((prevNotification) => 
                prevNotification.filter((notif) => notif.nickname !== nickname)
            );
        }else{
            setNotification((previous) => {
                // Check if the notification already exists
                const existingNotif = previous.find((value) => value.nickname === nickname);

                if (existingNotif) {
                    // Increment the num value for the existing notification
                    return previous.map((notif) =>
                        notif.nickname === nickname ? { ...notif, num: notif.num + 1 } : notif
                    );
                } else {
                    // Add a new notification with num set to 1
                    return [...previous, { nickname: nickname, num: 1 }];
                }
            });
        }
    }

    function countNotifWithNoTchat(){
        if (!seeTchat) {
            if (ws && user){
                ws.onmessage = (event) => {
                    const receivedMessage = JSON.parse(event.data); // Convertir la chaîne JSON en objet JavaScript

                    console.log("cc:",receivedMessage)

                    if (receivedMessage.Accept && receivedMessage.ObjectOfRequest === "message save"){
                        setNotif(receivedMessage.Tchat.Messages[0].Author)
                    }else if (receivedMessage.Accept && receivedMessage.ObjectOfRequest === "notifications" && receivedMessage.Tchat && (receivedMessage.Tchat.AuthorNotSee || receivedMessage.Tchat.Group) && !timout){

                        console.log("ggg")
                        console.log(receivedMessage.Tchat.Group)
                        timout = setTimeout(()=>{
                            if (receivedMessage.Tchat.AuthorNotSee){
                                for (let i = 0; i<receivedMessage.Tchat.AuthorNotSee.length; i++ ){
                                    setNotif(receivedMessage.Tchat.AuthorNotSee[i])
                                }
                            }
                            if (receivedMessage.Tchat && receivedMessage.Tchat.Group) {
                                receivedMessage.Tchat.Group.forEach(group => {
                                    if (group.NoSeeMessages > 0) {
                                        for (let i = 0; i < group.NoSeeMessages; i++) {
                                            setNotif(group.Name);
                                        }
                                    }
                                });
                            }                            
                        },200)
                    }else if (receivedMessage.Accept && receivedMessage.ObjectOfRequest === "new message group"){
                        setNotif(receivedMessage.Tchat.Messages[0].Groupe)
                    }else if (receivedMessage.Accept && receivedMessage.ObjectOfRequest === "actualise notif profil"){
                        updateProfilNotif()
                    }
                }
            }
        }
    }

    const updateProfilNotif = async ()=>{
        const formToken = new FormData
        formToken.append("token", cookieExist())
        formToken.append("userProfil", cookieExist())
        const data2 = await sendAndReceiveData("/api/follow", formToken);
        setNotifProfil(data2.userProfil.PrivateSub)
    }


    countNotifWithNoTchat()

    const setInvitations =(value) =>{
        setInvitationsGroup(value)
    }


    return (
        <>
        <div className={styles.dashboardTopPage}>
            <Link href="/home" className={styles.titleHome}>Social-Network</Link>
            <button className={styles.buttonConversations} onClick={handleTchat}>Conversations {notification && notification.length > 0 ? 
            (
                <div>
                    New message(s):{" "}
                    {notification.map((notif, index) => (
                        <span key={index}>
                            {notif.nickname} ({notif.num})
                            {index < notification.length - 1 ? ", " : ""}
                        </span>
                    ))}
                </div>
            ) : null}{inviationsGroup && inviationsGroup.length>0 ? (<div> Invitations: {inviationsGroup.length} </div>) : null}</button>
            <div className={styles.eventContainer} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <button className={styles.buttonNotif}>{events.length>0 ? "Events("+events.length+")" : "Events"}</button>
                {showExtraButtons && (
                    <div className={styles.extraButtons}>
                        <div className={styles.extraButtonDesc}>{events.length>0 ? "Events Availables:" : "No Events"}</div>
                        {events.map((event, index) => (
                            <div key={index}>
                                <button className={styles.extraButton} onClick={() => handleEventContent(index)}>
                                    {event.Titre}({event.Type})
                                </button>
                                {showContentEvent.index === index && showContentEvent.show && (
                                    <div>
                                        <div className={styles.infoEvents}>
                                            <div>Info Event:</div>
                                            <div>{event.EventDate}</div>
                                            {event.ImageName && <img className={styles.imageEvent} src={`${event.UrlImage}`} alt="Avatar" />}
                                            <div className={styles.infoEventContent}>{event.Content}</div>
                                            <div className={styles.infoUserEvent}>By {event.Author.Nickname}</div>
                                        </div>
                                        <div className={styles.followers_container}>
                                        {event.Followers && event.Followers.length > 0 ? (
                                            <span>Follow by: {event.Followers.join(', ')}</span>
                                        ) : (
                                            <span>Follow by:</span>
                                        )}
                                        </div>
                                        <div className={styles.followers_container}>
                                        {event.NoFollowers && event.NoFollowers.length > 0 ? (
                                            <span>Unfollow by: {event.NoFollowers.join(', ')}</span>
                                        ) : (
                                            <span>Unfollow by:</span>
                                        )}
                                        </div>
                                        <div className={styles.buttonsEvents}>
                                            <button onClick={() => handleEventYes(event.Titre)} className={styles.buttonGoEvent}>Go!!!</button>
                                            <button onClick={() => handleEventNo(event.Titre)} className={styles.buttonNotGoingEvent}>No...</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Link href={{ pathname: "/profil", query: { user: userInfo } }} className={styles.buttonProfil} onClick={redirection}>Profil {notifProfil ? `(${notifProfil.length})` : null}</Link>
            <Link href="/" className={styles.buttonLogout} onClick={logout}>Logout</Link>
        </div>
        {seeTchat && userComplete && ws && (<Tchat onClose={handleTchat} ws={ws} user={userComplete} setNotification={setNotif} notification={notification} invitations={inviationsGroup} setInvitations={setInvitationsGroup}/>)}
        </>
    );
}

export default DashboardTop;