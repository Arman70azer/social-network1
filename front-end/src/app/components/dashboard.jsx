import styles from '../styles/home.module.css'; // Utilisez des guillemets simples ou doubles pour l'importation
import Link from 'next/link';
import { useState } from 'react';


//TODO Mettre les href une fois les pages finit !!!!!
function DashboardTop () {
    const [showExtraButtons, setShowExtraButtons] = useState(false);

    const handleMouseEnter = () => {
        setShowExtraButtons(true);
    };

    const handleMouseLeave = () => {
        setShowExtraButtons(false);
    };
    return (
        <div className={styles.dashboardTopPage}>
            <Link href="/home" className={styles.titleHome}>Social-Network</Link>
            <Link href="/message" className={styles.buttonConversations}>Conversations</Link>
            <div className={styles.eventContainer} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <button className={styles.buttonNotif}>Event</button>
                {showExtraButtons && (
                    <div className={styles.extraButtons}>
                        <button className={styles.extraButton}>See events</button>
                        <button className={styles.extraButton}>Organise a event</button>
                    </div>
                )}
            </div>
            <Link href="/profil" className={styles.buttonProfil}>Profil</Link>
            <Link href="/login" className={styles.buttonLogout}>Logout</Link>
        </div>
    );
}

export default DashboardTop;