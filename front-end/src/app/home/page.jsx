import DashboardTop from "../components/dashboard"

//Renvoie un array de tout les posts
async function fetchPosts() {
    const response = await fetch((`http://localhost:8000/api/home`),{
        method: 'GET'
    });
    return response.json();
}

export default async function Page(){
    const posts = await fetchPosts()

    console.log(posts)
    return (
        <div>
            <div >post: {posts[0].Titre}</div>
        </div>

    )
}