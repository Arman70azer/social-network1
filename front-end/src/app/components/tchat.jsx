import { useEffect, useState, useRef } from "react"
import styles from "../styles/tchat.module.css"
import sendMessageToWebsocket from "../lib/wsSendMessage"
import cookieExist from "../utils/cookieUserExist"
import CreateGroup from "../components/createGroup"

function Tchat({ onClose, ws, user, setNotification, notification}) {
    const [connectUsers, setConnectUsers] = useState([]);
    const [users, setUsers]=useState([])
    const [openChat, setOpenChat] = useState({
        open:false,
        nickname:""
    })
    const [message, setMessage] = useState("")
    const chatWindowRef = useRef(null);
    const [chats, setChats] = useState([])
 
    const [notSub, setNotSub] = useState("")
    const [creaGroup, setCreaGroup] = useState(false)

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
                    console.log(receivedMessage.Tchat.Clients.filter((userConnect)=> userConnect.Nickname !== user.Nickname ))
                }else if (receivedMessage.Accept && (receivedMessage.ObjectOfRequest === "message save")){
                    if (chats){
                        setChats((prevChats) => [...prevChats, receivedMessage.Tchat.Messages[0]]);
                    }else{
                        setChats(receivedMessage.Tchat.Messages)
                    }
                    if (openChat.open && openChat.nickname === receivedMessage.Tchat.Messages[0].Author){
                        const request = {
                            User: cookieExist(),
                            ToUser: receivedMessage.Tchat.Messages[0].Author,
                            Origin: "chat-home",
                            Nature: "chat",
                            ObjectOfRequest: "user see message",
                        };
                        sendMessageToWebsocket(ws, request)
                        scrollToBottom();
                    }else if (!openChat.open && receivedMessage.Tchat.Messages[0].Recipient=== user.Nickname){
                        setNotification(receivedMessage.Tchat.Messages[0].Author)
                    }
                }else if (!receivedMessage.Accept && receivedMessage.ObjectOfRequest === "You're not following this user or he don't follow you"){
                    setNotSub(receivedMessage.ToUser)
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
       
        const request = {
            User: cookieExist(),
            ToUser: user,
            Origin: "chat-home",
            Nature: "chat",
            ObjectOfRequest: "user see message",
        };
        sendMessageToWebsocket(ws, request)

        setNotification(user, true)
        
        scrollToBottom();
    }

    const messageIsWritting = (event) => {
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
            scrollToBottom()
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

    const creaGroupSet=()=>{
        setCreaGroup(!creaGroup)
    }
    
    onMessageWS()

    return (
        <div className={styles.overlay}>
            <div className={styles.settingsContainer}>
                <div className={styles.buttonContainer}>
                    <button className={styles.closeButton} onClick={onClose}>X</button>
                    <button className={styles.createGroup} onClick={creaGroupSet}>Create a group</button>
                </div>
                <div className={styles.center}>
                    {creaGroup && users && (<CreateGroup users={users}/>)}
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
                                        {notification && notification.filter((value) => value.nickname === userTchat.Nickname).length > 0 ? (
                                            <div key={index} className={styles.newMessages}>
                                                New message({notification.find((value) => value.nickname === userTchat.Nickname).num})!!!
                                            </div>
                                        ) : null}
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
