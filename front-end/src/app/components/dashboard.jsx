import styles from '../styles/home.module.css'; // Utilisez des guillemets simples ou doubles pour l'importation
import Link from 'next/link';
import { useState, useEffect } from 'react';
import sendFormToBack from '../lib/sendFormToBack';
import cookieExist from '../utils/cookieUserExist';


//TODO Mettre les href une fois les pages finit !!!!!
function DashboardTop({ events = [], ws = null }) {
    const origin= "home";

    const [showExtraButtons, setShowExtraButtons] = useState(false);
    const [showContentEvent, setShowContent] = useState({ index: null, show: false });

    const [user, setUser] = useState("");
    const [userInfo, setUserInfo] = useState("")
    useEffect(() => {
        const userFromCookie = cookieExist()
        if (userFromCookie) {
            setUser(userFromCookie);
        }
        const formToken = new FormData
        formToken.append("token", userFromCookie)
        const userInfo1 =  sendFormToBack("api/profil", formToken)
        setUserInfo(userInfo1)
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

    const handleEventYes=(titre)=>{
        if (ws != null){
            const formEventPost = new FormData();
            formEventPost.append("event", titre)
            formEventPost.append("token", user)
            formEventPost.append("nature", "yes")
            formEventPost.append("origin", origin)

            sendFormToBack("/api/home",formEventPost)
        }
    }
    const handleEventNo= (titre)=>{
        if (ws != null){
            const formEventPost = new FormData();
            formEventPost.append("event", titre)
            formEventPost.append("token", user)
            formEventPost.append("nature", "no")
            formEventPost.append("origin", origin)

            sendFormToBack("/api/home", formEventPost)
        }
    }


    return (
        <div className={styles.dashboardTopPage}>
            <Link href="/home" className={styles.titleHome}>Social-Network</Link>
            <Link href="/message" className={styles.buttonConversations}>Conversations</Link>
            <div className={styles.eventContainer} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <button className={styles.buttonNotif}>{events.length>0 ? "Events("+events.length+")" : "Events"}</button>
                {showExtraButtons && (
                    <div className={styles.extraButtons}>
                        <div className={styles.extraButtonDesc}>{events.length>0 ? "Events Availables:" : "No Events"}</div>
                        {events.map((event, index) => (
                            <div key={index}>
                                <button className={styles.extraButton} onClick={() => handleEventContent(index)}>
                                    {event.Titre}
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
            <Link href={{ pathname: "/profil", query: { user: userInfo.Nickname } }} className={styles.buttonProfil}>Profil</Link>
            <Link href="/" className={styles.buttonLogout} onClick={logout}>Logout</Link>
        </div>
    );
}

export default DashboardTop;