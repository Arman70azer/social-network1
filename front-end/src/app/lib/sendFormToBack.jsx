export default async function sendFormToBack(page, formData) {
    try {
        const url = "http://localhost:8000" + page;
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            // Si la réponse n'est pas un succès (statut HTTP 200-299)
            const errorMessage = await response.text();
            setTimeout(() => {
                console.log(`Error submitting form: ${response.status} - ${errorMessage}`);
            }, 3000); // Attendre 3 secondes avant d'afficher l'erreur
        }

    } catch (error) {
        setTimeout(() => {
            console.error('Error submitting form:', error);
        }, 3000); // Attendre 3 secondes avant d'afficher l'erreur
    }
}
