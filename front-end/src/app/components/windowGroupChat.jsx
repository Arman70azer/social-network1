import { useState, useRef, useEffect } from "react";
import styles from "../styles/tchat.module.css";
import sendMessageToWebsocket from "../lib/wsSendMessage";

function ChatWindowGroup({ ws, user, group }) {
    const [message, setMessage]= useState("")
    const chatWindowRef = useRef(null);
    const [newMessages, setNewMessages]= useState([])

    const userSeeChatGroup = ()=>{
        const request = {
            User: user.UUID,
            Origin: "chat-Group",
            Nature: "chat",
            ObjectOfRequest: "message group see",
            toUser: group.Name,
        };
        
        sendMessageToWebsocket(ws, request)
    }

    useEffect(()=>{
       userSeeChatGroup()

    },[])

    // Fonction utilitaire pour obtenir la liste formatée des noms des membres
    const formatMemberList = () => {
        return group.Members.map((member) => member.Nickname).join(", ");
    };

    const messageIsWritting = (event) => {
        const { value } = event.target;
        setMessage(value);
        console.log(newMessages)
    }

    const scrollToBottom = async() => {
        setTimeout(()=>{
            if (chatWindowRef.current) {
                chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
            }
        }, 100)
    };

    const handleKeyPress = async (e) => {
        if (e.key === 'Enter' && message){
            const request = {
                User: user.UUID,
                Origin: "chat-home",
                Nature: "chat",
                ObjectOfRequest: "new message group",
                toUser: group.Name,
                Message: message
            };
    
            sendMessageToWebsocket(ws, request)
            setMessage("")
            scrollToBottom()
        }
    }

    const onMessageWS = async () => {
        if (ws && user){
            ws.onmessage = (event) => {
                const receivedMessage = JSON.parse(event.data); // Convertir la chaîne JSON en objet JavaScript
                if (receivedMessage.Accept && receivedMessage.ObjectOfRequest === "new message group" && receivedMessage.Tchat.Messages[0].Groupe===group.Name) {
                    setNewMessages((previous)=> [...previous, receivedMessage.Tchat.Messages[0]])
                    scrollToBottom()
                    userSeeChatGroup()
                }
            }
        }
    }

    onMessageWS()

    return (
        <>
            <div className={styles.chatWindow}>
                <div className={styles.header}>
                    <h2>Chat: {group.Name}</h2>
                    <h3>Members: {formatMemberList()}</h3>
                </div>
                <div className={styles.messages} ref={chatWindowRef}>
                    {group.Conv && group.Conv.map((message, index) => (
                        message && (
                            <div key={index} className={message.Author === user.Nickname ? styles.myMessage : styles.otherMessage}>
                                <div className={styles.messageContent}>
                                    <p>{message.Author}: {message.Content}</p>
                                    <p>{message.Date}</p>
                                </div>
                            </div>
                        )
                    ))}
                    {newMessages && newMessages.length > 0 && newMessages.map((newMessage, newMessageIndex) => (
                        newMessage && (
                            <div key={`new-${newMessageIndex}`} className={newMessage.Author === user.Nickname ? styles.myMessage : styles.otherMessage}>
                                <div className={styles.messageContent}>
                                    <p>{newMessage.Author}: {newMessage.Content}</p>
                                    <p>{newMessage.Date}</p>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </div>

            <div className={styles.center}>
            <input type="text" className={styles.chatInput} value={message} id="message" onChange={messageIsWritting} placeholder="Type a message..."  onKeyDown={handleKeyPress}/>
            </div>
        </>
    );
}

export default ChatWindowGroup;
