
export default function openWebSocketConnexion() {
  const ws = new WebSocket('ws://localhost:8000/websocket');

  // Gérer les erreurs de connexion WebSocket
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    // Gérez les erreurs de connexion ici
  };

  return ws
}
