export default function WebSocketComponent(origin, user, type, message) {
  // Ouvrir une connexion WebSocket
  const ws = new WebSocket('ws://localhost:8000/websocket');

  // Envoyer un message au serveur WebSocket lorsque la connexion est établie
  ws.onopen = () => {
    const messageObject = {
      origin: origin, 
      user: user,
      message: {
        type: type,
        content: message
      }
    };

    // Convertir l'objet JSON en chaîne JSON
    const jsonString = JSON.stringify(messageObject);

    // Envoyer la chaîne JSON au serveur WebSocket
    ws.send(jsonString);
  };

  // Gérer les messages reçus du serveur WebSocket
  ws.onmessage = (event) => {
    const receivedMessage = event.data;
    console.log("Message reçu du serveur WebSocket:", receivedMessage);
  };

  // Fermer la connexion WebSocket lorsque le type est "logout"
  if (type === "logout") {
    return () => {
      ws.close();
    };
  }
}

