export default function sendMessageToWebsocket(ws, message) {
    // Vérifier si la connexion WebSocket est valide
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.error("La connexion WebSocket n'est pas ouverte ou n'est pas valide.");
        return;
    }

    try {
        ws.send(JSON.stringify(message));
<<<<<<< HEAD
=======
        console.log("envoyer to back")
>>>>>>> origin
    } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error);
    }
}
