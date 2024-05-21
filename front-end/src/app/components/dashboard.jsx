import styles from '../styles/home.module.css'; // Utilisez des guillemets simples ou doubles pour l'importation
import Link from 'next/link';
import { useState } from 'react';
import ContentEvent from '../components/contentEvent'


//TODO Mettre les href une fois les pages finit !!!!!
function DashboardTop({ events = [] }) {
    const [showExtraButtons, setShowExtraButtons] = useState(false);
    const [showContentEvent, setShowContent] = useState({ index: null, show: false });

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

    return (
        <div className={styles.dashboardTopPage}>
            <Link href="/home" className={styles.titleHome}>Social-Network</Link>
            <Link href="/message" className={styles.buttonConversations}>Conversations</Link>
            <div className={styles.eventContainer} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <button className={styles.buttonNotif}>Event ({events.length})</button>
                {showExtraButtons && (
                    <div className={styles.extraButtons}>
                        <div className={styles.extraButtonDesc}>Events Available:</div>
                        {events.map((event, index) => (
                            <div key={index}>
                                <button className={styles.extraButton} onClick={() => handleEventContent(index)}>
                                    - {event.Titre}
                                </button>
                                {showContentEvent.index === index && showContentEvent.show && (
                                    <div>
                                        <div>{event.Content}</div>
                                        <div>{event.Author.Nickname}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Link href="/profil" className={styles.buttonProfil}>Profil</Link>
            <Link href="/login" className={styles.buttonLogout}>Logout</Link>
        </div>
    );
}

export default DashboardTop;