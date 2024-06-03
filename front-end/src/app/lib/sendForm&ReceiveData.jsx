export default async function sendFormToBack(page, formData) {
    try {
        const url = "http://localhost:8000" + page;
        const response = await fetch(url, {
        method: 'POST',
        body: formData,
        });
        const data = await response.json();
        if (!response.ok) {
            console.log("Error response")
            return data
        }else{
            console.log("Réponse du serveur :", data);
            return data
        }
    } catch (error) {
        setError(true);
        setMessage("Erreur lors de la connexion");
        console.error("Erreur lors de la connexion :", error);
    }
}
