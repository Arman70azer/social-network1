import { useEffect } from "react"
import styles from "../styles/tchat.module.css"
import sendMessageToWebsocket from "../lib/wsSendMessage"
function Tchat({onClose, ws}){

    useEffect(

        
        
        sendMessageToWebsocket(ws)
    )

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