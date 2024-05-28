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
            console.log(`Error submitting form: ${response.status} - ${errorMessage}`);
        }

    } catch (error) {
        console.error('Error submitting form:', error);
    }
}
