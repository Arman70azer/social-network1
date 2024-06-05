import Cookies from "js-cookie";

// Renvoie un array de tous les posts, users et events
export default async function fetchDataHome() {
    const form = new FormData();
    form.append("token", Cookies.get("token"));

    try {
        const response = await fetch(`http://localhost:8000/api/home`, {
            method: 'POST',
            body: form
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();

        if (!text) {
            throw new Error('La réponse est vide');
        }

        try {
            const data = JSON.parse(text);
            return data;
        } catch (err) {
            throw new Error('Erreur de parsing JSON: ' + err.message);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        throw error;
    }
}
