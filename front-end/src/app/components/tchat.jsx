import { useEffect, useState, useRef } from "react"
import styles from "../styles/tchat.module.css"
import sendMessageToWebsocket from "../lib/wsSendMessage"
import cookieExist from "../utils/cookieUserExist"

function Tchat({ onClose, ws, user}) {
    const [connectUsers, setConnectUsers] = useState([]);
    const [users, setUsers]=useState([])
    const [openChat, setOpenChat] = useState({
        open:false,
        nickname:""
    })
    const [notif, setNotif]=useState([])
    const [message, setMessage] = useState("")
    const chatWindowRef = useRef(null);
    const [chats, setChats] = useState([])
 
    const [notSub, setNotSub] = useState("")

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
                if (receivedMessage.Accept && (receivedMessage.ObjectOfRequest === "see users connect" || receivedMessage.Nature==="user disconnect or first connexions")) {
                    setConnectUsers(receivedMessage.Tchat.ClientsConnect.filter((userConnect)=> userConnect.Nickname !== user.Nickname ))
                    setUsers(receivedMessage.Tchat.Clients.filter((userConnect)=> userConnect.Nickname !== user.Nickname ))
                    if (receivedMessage.ObjectOfRequest == "see users connect"){
                        setChats(receivedMessage.Tchat.Messages)
                    }
                }else if (receivedMessage.Accept && (receivedMessage.ObjectOfRequest === "message save")){
                    if (chats){
                        setChats((prevChats) => [...prevChats, receivedMessage.Tchat.Messages[0]]);
                    }else{
                        setChats(receivedMessage.Tchat.Messages)
                    }
                    if (openChat.open){
                        scrollToBottom();
                    }else if (!openChat.open && receivedMessage.Tchat.Messages[0].Recipient=== user.Nickname){
                        const request = {
                            User: cookieExist(),
                            ToUser: receivedMessage.Tchat.Messages[0].Author,
                            Origin: "chat-home",
                            Nature: "chat",
                            ObjectOfRequest: "user not see message",
                            Message:receivedMessage.Tchat.Messages[0].Content
                        };
                        sendMessageToWebsocket(ws,request)
                    }
                }else if (!receivedMessage.Accept && receivedMessage.ObjectOfRequest === "You're not following this user or he don't follow you"){
                    setNotSub(receivedMessage.ToUser)
                }else if (receivedMessage.Accept && receivedMessage.ObjectOfRequest === "user not see message"){
                    setNotif((prevNotif) => [...prevNotif, receivedMessage.User]);       
                
                }else if (receivedMessage.Accept && receivedMessage.ObjectOfRequest === "user see message"){
                    console.log("sse see see")
                    setNotif(notif.filter((userName) => userName !== receivedMessage.User));
                }
                console.log("Réponse du serveur (ws):", receivedMessage)
            }
        }
    }

    const openChatWithUser=(user)=>{
        setOpenChat({
            open:!openChat.open,
            nickname:user
        })
        if (notif.filter((newMessageUser)=> newMessageUser === user).length>0){
            const request = {
                User: cookieExist(),
                ToUser: user,
                Origin: "chat-home",
                Nature: "chat",
                ObjectOfRequest: "user see message",
            };
            sendMessageToWebsocket(ws, request)
        }
        scrollToBottom();
    }

    const messageIsWritting = (event) => {
        console.log(users)
        console.log(connectUsers)
        const { value } = event.target;
        setMessage(value);
    }

    const handleKeyPress = async (e) => {
        if (e.key === 'Enter' && message){
            const request = {
                User: cookieExist(),
                Origin: "chat-home",
                Nature: "chat",
                ObjectOfRequest: "new message",
                toUser: openChat.nickname,
                Message: message
            };
    
            sendMessageToWebsocket(ws, request)
            setMessage("")
        }
    }

    const isUserConnected = (userNickname) => {
        const inConnectUsers = connectUsers && connectUsers.some((userConnect) => userConnect.Nickname === userNickname);
        const inOtherUsers = users && users.some((otherUser) => otherUser.Nickname === userNickname);
        return inConnectUsers && inOtherUsers;
    };
    const scrollToBottom = async() => {
        setTimeout(()=>{
            if (chatWindowRef.current) {
                chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
            }
        }, 100)
    };
    
    onMessageWS()

    return (
        <div className={styles.overlay}>
            <div className={styles.settingsContainer}>
                <div className={styles.center}>
                    <button className={styles.closeButton} onClick={onClose}>X</button>
                    <div className={styles.usersList}>
                        <div className={styles.center}>Users Connects:</div>
                        {users && connectUsers && users.map((userTchat, index) => (
                            <div key={index}>
                                <div key={index} className={styles.connectedUser} onClick={() => openChatWithUser(userTchat.Nickname)}>
                                    <div className={styles.userAvatar}>
                                        {/* Placeholder for avatar, replace with actual image if available */}
                                        <img src={userTchat.UrlImage} alt="avatar" />
                                    </div>
                                    <div className={styles.userNickname}>
                                        <div className={isUserConnected(userTchat.Nickname) ? styles.pointVert : styles.pointNoir}></div>
                                        {userTchat.Nickname}
                                        {notif && notif.filter((value) => (value === userTchat.Nickname)).length>0 ? (
                                                <div key={index} className={styles.newMessages}>: New message({notif.filter((value) => (value === userTchat.Nickname)).length})!!!</div>
                                            ) : (null
                                        )}
                                    </div>
                                </div>

                                {openChat.open && openChat.nickname === userTchat.Nickname && (
                                    <div>
                                        <div className={styles.chatWindow}>
                                            <div className={styles.header}>
                                                <h2>Chat</h2>
                                            </div>
                                            <div className={styles.messages} ref={chatWindowRef}>
                                                {chats && chats.map((message, index) => (
                                                    message && (message.Author === openChat.nickname || message.Recipient === openChat.nickname) && (
                                                        <div key={index} className={message.Author === user.Nickname ? styles.myMessage : styles.otherMessage}>
                                                            <div className={styles.messageContent}>
                                                                <p>{message.Content}</p>
                                                                <p>{message.Date}</p>
                                                            </div>
                                                        </div>
                                                    )
                                                ))}
                                                {notSub === openChat.nickname && (
                                                    <div className={styles.notSub}>You're not subscribed to this user Or he don't follow you</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className={styles.center}>
                                            <input type="text" className={styles.chatInput} value={message} id="message" onChange={messageIsWritting} placeholder="Type a message..." onKeyDown={handleKeyPress} />
                                        </div>
                                    </div>
                                )}
                             </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Tchat;
