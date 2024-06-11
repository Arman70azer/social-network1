import { useEffect, useState } from "react"
import styles from "../styles/tchat.module.css"
import sendMessageToWebsocket from "../lib/wsSendMessage"
import cookieExist from "../utils/cookieUserExist"
function Tchat({ onClose, ws, user}) {
    const [connectUsers, setConnectUsers] = useState([]);

    useEffect(() => {
        const searchConnectUser = async () => {
            const request = {
                User: cookieExist(),
                Origin: "chat-home",
                Nature: "chat",
                ObjectOfRequest: "see users connect"
            };

            try {
                sendMessageToWebsocket(ws, request);
            } catch (error) {
                console.error("Erreur lors de l'envoi du message ou de la réception de la réponse:", error);
            }
        };

        searchConnectUser();

        // Dépendances de useEffect vides pour s'assurer que l'effet ne s'exécute qu'une seule fois
    }, [ws]);

    const onMessageWS = async () => {
        if (ws && user){
            ws.onmessage = (event) => {
                const receivedMessage = JSON.parse(event.data); // Convertir la chaîne JSON en objet JavaScript
                if (receivedMessage.Accept && (receivedMessage.ObjectOfRequest === "see users connect" || receivedMessage.Nature==="user disconnect")) {
                    setConnectUsers(receivedMessage.Tchat.ClientsConnect.filter((userConnect)=> userConnect.Nickname !== user.Nickname ))
                }

                console.log("Réponse du serveur (ws):", receivedMessage)
            }
        }
    }

    onMessageWS()

    return (
        <div className={styles.overlay}>
            <div className={styles.settingsContainer}>
                <div className={styles.center}>
                    <button className={styles.closeButton} onClick={onClose}>X</button>
                    {connectUsers && connectUsers.map((connectUser, index) => (
                        <div key={index} className={styles.connectedUsers}>
                            {connectUser.Nickname}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Tchat;
