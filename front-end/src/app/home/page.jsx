import styles from '../styles/home.module.css'; // Utilisez des guillemets simples ou doubles pour l'importation

export default function Page() {
    return (
        <div className={styles.dashboardTopPage}>
            <div className={styles.titleHome}>Social-Network</div>
            <button className={styles.buttonConversations}>Conversations</button>
            <button className={styles.buttonNotif}>Notifications</button>
            <button className={styles.buttonProfil}>Profil</button>
            <button className={styles.buttonLogout}>Logout</button>
        </div>
    );
}
