import styles from '../styles/home.module.css'; // Utilisez des guillemets simples ou doubles pour l'importation

//TODO Mettre les href une fois les pages finit !!!!!
function DashboardTop () {
    return (
        <div className={styles.dashboardTopPage}>
            <button className={styles.titleHome}>Social-Network</button>
            <button className={styles.buttonConversations}>Conversations</button>
            <button className={styles.buttonNotif}>Notifications</button>
            <button className={styles.buttonProfil}>Profil</button>
            <button className={styles.buttonLogout}>Logout</button>
        </div>
    );
}

export default DashboardTop;