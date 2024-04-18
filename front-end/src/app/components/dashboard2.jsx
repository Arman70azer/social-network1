import styles from '../styles/home.module.css'; // Utilisez des guillemets simples ou doubles pour l'importation

//TODO Mettre les href une fois les pages finit !!!!!
function DashboardBottom () {
    return (
        <div className={styles.dashboardBottomPage}>
            <button className={styles.buttonPostPublic}>Public Posts</button>
            <button className={styles.buttonPostPrivates}>Privates Posts</button>
        </div>
    );
}

export default DashboardBottom;