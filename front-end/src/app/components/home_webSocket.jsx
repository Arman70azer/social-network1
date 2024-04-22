import { useEffect, useState } from 'react';

export default function Websocket() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Ouvrir une connexion WebSocket
    const ws = new WebSocket('ws://localhost:8000/ws');

    // Gérer les messages reçus du serveur WebSocket
    ws.onmessage = (event) => {
      setMessage(event.data);
    };

    // Fermer la connexion WebSocket lorsque le composant est démonté
    return () => {
      ws.close();
    };
  }, []);

  return (
    <div>
      <p>Message du serveur WebSocket : {message}</p>
    </div>
  );
}
