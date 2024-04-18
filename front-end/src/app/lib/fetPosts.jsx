//Renvoie un array de tout les posts
export default async function fetchPosts() {
    const response = await fetch((`http://localhost:8000/api/home`),{
        method: 'GET'
    });
    return response.json();
}