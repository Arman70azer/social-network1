export default function openWebSocketConnexion(ws) {
  // Gérer les messages reçus du serveur WebSocket
  ws.onmessage = (event) => {
    const receivedMessage = event.data;
    console.log("Message reçu du serveur WebSocket:", receivedMessage);
    // Traitez les messages reçus ici
  };

  // Gérer les erreurs de connexion WebSocket
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    // Gérez les erreurs de connexion ici
  };

  return ws
}
