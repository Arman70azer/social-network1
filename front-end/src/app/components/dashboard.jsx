import styles from '../styles/home.module.css'; // Utilisez des guillemets simples ou doubles pour l'importation
import Link from 'next/link';


//TODO Mettre les href une fois les pages finit !!!!!
function DashboardTop () {
    return (
        <div className={styles.dashboardTopPage}>
            <Link href="/home" className={styles.titleHome}>Social-Network</Link>
            <Link href="/message" className={styles.buttonConversations}>Conversations</Link>
            <Link href="/notification" className={styles.buttonNotif}>Event</Link>
            <Link href="/profil" className={styles.buttonProfil}>Profil</Link>
            <Link href="/login" className={styles.buttonLogout}>Logout</Link>
        </div>
    );
}

export default DashboardTop;