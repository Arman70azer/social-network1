import Cookies from "js-cookie"
//Renvoie un array de tout les posts, users et events
export default async function fetchDataHome() {
    const form = new FormData
    form.append("token",Cookies.get("token"))
    const response = await fetch((`http://localhost:8000/api/home`),{
        method: 'POST',
        body: form
    });
    return response.json();
}