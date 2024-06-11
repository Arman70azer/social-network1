import { useEffect } from "react"
import styles from "../styles/tchat.module.css"
import sendMessageToWebsocket from "../lib/wsSendMessage"
import cookieExist from "../utils/cookieUserExist"
function Tchat({onClose, ws}){

    useEffect(() => {
        
        const searchConnectUser= async () =>{

            const request ={
                User: cookieExist(),
                Origin: "chat-home",
                Nature:"chat",
                ObjectOfRequest: "see users connect"
            }

            try{
                const response = await sendMessageToWebsocket(ws, request)
                console.log("Réponse reçue du serveur:", response);
            }catch(error){
                console.error("Erreur lors de l'envoi du message ou de la réception de la réponse:", error);
                
            }
        }
        searchConnectUser()

    },);

    return(
        <div className={styles.overlay}>
                <div className={styles.settingsContainer}>
                    <div className={styles.center}>
                        <button className={styles.closeButton} onClick={onClose}>X</button>
                        <div className={styles.connectedUsers}>

                        </div>
                    </div>
                </div>
        </div>
    )
}

export default Tchat