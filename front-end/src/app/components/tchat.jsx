import { useEffect } from "react"
import styles from "../styles/tchat.module.css"
import sendMessageToWebsocket from "../lib/wsSendMessage"
import cookieExist from "../utils/cookieUserExist"
function Tchat({onClose, ws}){

    useEffect(() => {
        
        const request1 ={
            User: cookieExist(),
            Origin: "chat-home",
            Nature:"chat",
            ObjectOfRequest: "see users connect"
        }
        sendMessageToWebsocket(ws, request1)

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