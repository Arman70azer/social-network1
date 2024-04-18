import DashboardTop from "../components/dashboard";
import DashboardBottom from "../components/dashboard2"
import fetchPosts from "../lib/fetPosts";
import styles from '../styles/home.module.css'

export default async function Page(){
    const posts = await fetchPosts();

    console.log(posts);
    //post.map va parcourir tout les posts dans "posts" et les afficher
    return (
        <div>
            <DashboardTop/>
            <div className={styles.Content}>     
                {posts.map((post, index) => (
                    <div key={index} className={styles.windowPost} id={`postBy${post.Author}`}>
                        <div className={styles.authorPost}>
                            --- {post.Author} publish ---
                        </div>
                        <div className={styles.titlePost}>
                            {post.Titre}:
                        </div>
                        <div className={styles.contentPost}>
                            {post.Content}
                        </div>
                        <div className={styles.datePost}>
                            {post.Date}
                        </div>
                    </div>
                ))}
            </div>
            <DashboardBottom/>
        </div>
    );
}