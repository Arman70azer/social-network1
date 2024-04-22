import styles from '../styles/home.module.css'; // Utilisez des guillemets simples ou doubles pour l'importation
import Link from 'next/link';

//TODO Mettre les href une fois les pages finit !!!!!
function DashboardBottom () {
    return (
        <div className={styles.dashboardBottomPage}>
            <Link href="/createPost" className={styles.buttonCreatePost}>Create New Post [+]</Link>
            <button className={styles.buttonPostPublic}>Publics Posts</button>
            <button className={styles.buttonPostPrivates}>Privates Posts</button>
        </div>
    );
}

export default DashboardBottom;