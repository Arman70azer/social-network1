export default function openWebSocketConnexion(ws) {

  // Gérer les erreurs de connexion WebSocket
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    // Gérez les erreurs de connexion ici
  };

  return ws
}
