export default function openWebSocketConnexion(user) {
    const ws = new WebSocket('ws://localhost:8000/websocket');

    ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    };

    ws.onopen = () => {
    // Envoyer le nom d'utilisateur au serveur
    const data = JSON.stringify({ User: user });
    ws.send(data);
    console.log('WebSocket connection opened.', data);
    };

    ws.onclose = (event) => {
    console.log('WebSocket connection closed. Reconnecting...', event);
    setTimeout(() => {
        createWebSocket();
    }, 1000); // Reconnect after 1 second
    };

    ws.onmessage =(event)=>{
    console.log('Message received from server:', event.data);
    }

    return ws;
};
