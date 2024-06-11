export default function sendMessageToWebsocket(ws, message) {
    return new Promise((resolve, reject) => {
        // Vérifier si la connexion WebSocket est valide
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error("La connexion WebSocket n'est pas ouverte ou n'est pas valide.");
            reject(new Error("La connexion WebSocket n'est pas ouverte ou n'est pas valide."));
            return;
        }

        // Gérer les erreurs WebSocket
        ws.onerror = (error) => {
            console.error("Erreur WebSocket:", error);
            reject(error); // Rejeter la promesse en cas d'erreur
        };

        // Envoyer le message au serveur WebSocket
        try {
            ws.send(JSON.stringify(message));
            console.log("Message envoyé au serveur");
        } catch (error) {
            console.error("Erreur lors de l'envoi du message:", error);
            reject(error); // Rejeter la promesse en cas d'erreur
        }
    });
}
