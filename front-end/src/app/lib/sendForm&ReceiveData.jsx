export default async function sendAndReceiveData(page, formData) {

    try {
        const url = "http://localhost:8000" + page;
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Error response:", errorData);
            throw new Error(`HTTP error! status: ${response.status}`);
        }else{
            const data = await response.json();
            return data;
        }

    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        throw error;
    }
}


