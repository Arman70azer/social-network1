//Renvoie un array de tout les posts, users et events
export default async function fetchDataHome() {
    const response = await fetch((`http://localhost:8000/api/home`),{
        method: 'GET'
    });
    return response.json();
}