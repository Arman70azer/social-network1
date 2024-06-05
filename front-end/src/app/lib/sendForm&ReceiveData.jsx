export default async function sendFormToBack(page, formData) {

    try {
        const url = "http://localhost:8000" + page;
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        // Vérifier si la réponse HTTP est OK (status code 200-299)
        if (!response.ok) {
            // Tenter de récupérer les détails de l'erreur du serveur
            const errorData = await response.json().catch(() => ({}));
            console.error("Error response:", errorData);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Tenter de parser la réponse JSON
        const data = await response.json();
        console.log("Réponse du serveur :", data);
        return data;

    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        throw error;  // Relancer l'erreur pour permettre à l'appelant de la gérer
    }
}

