import { useEffect, useState, useRef } from "react"
import styles from "../styles/tchat.module.css"
import sendMessageToWebsocket from "../lib/wsSendMessage"
import cookieExist from "../utils/cookieUserExist"
import CreateGroup from "../components/createGroup"
import ChatWindowGroup from "../components/windowGroupChat"
import EmojiPickerComponent from "./Emojies"
import sendAndReceiveData from "../lib/sendForm&ReceiveData"
import sendFormToBack from "../lib/sendFormToBack"

function Tchat({ onClose, ws, user, setNotification, notification, invitations, setInvitations}) {
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

    const [inviations2, setInvitations2]=useState([])

    const [groups, setGroups] = useState([])
    const [allGroups, setAllGroups] = useState([])
    const [seeGroup, setSeeGroup] = useState({
        Name:"",
        exist:false,
    });

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
                        setGroups(receivedMessage.Tchat.Group)
                        setAllGroups(receivedMessage.Tchat.AllGroup)
                        setInvitations(receivedMessage.Tchat.Invitations)
                        setInvitations2(receivedMessage.Tchat.RequestToJoin)
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
                }else if (receivedMessage.Accept && receivedMessage.ObjectOfRequest === "new message group" && groups.find((value)=> value.Name == receivedMessage.Tchat.Messages[0].Groupe)) {
                    setNotification(receivedMessage.Tchat.Messages[0].Groupe)
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
    
    const seeGroupOnClick=(name)=>{
        if (!seeGroup.exist){
            setSeeGroup({
                exist:true,
                Name: name
            })
        }else{

            setSeeGroup({
                exist:false,
                Name: ""
            })
        }
    }

    const handleAccept = (group)=>{
        const request = {
            User: cookieExist(),
            Origin: "chat-home",
            Nature: "chat",
            ObjectOfRequest: "accept invitation",
            toUser: group,
        };

        sendMessageToWebsocket(ws, request)
        setInvitations(invitations.filter((value)=> value !== group))
        setGroups((prevGroups) => [...prevGroups, { Name: group }]);
    }

    const handleDecline=(group)=>{
        const request = {
            User: cookieExist(),
            Origin: "chat-home",
            Nature: "chat",
            ObjectOfRequest: "decline invitation",
            toUser: group,
        };

        sendMessageToWebsocket(ws, request)
        setInvitations(invitations.filter((value)=> value !== group))
    }

    const handleAccept2 =(group)=>{
        const partGroup = group.split(" ")
        const request = {
            User: cookieExist(),
            Origin: "chat-home",
            Nature: "chat",
            ObjectOfRequest: "accept invitation2",
            toUser: partGroup[0],
            Message: partGroup[partGroup.length-1]
        };

        sendMessageToWebsocket(ws, request)
        setInvitations2(inviations2.filter((value)=> value !== group))
    }

    const handleDecline2=(group)=>{
        const partGroup = group.split(" ")
        const request = {
            User: cookieExist(),
            Origin: "chat-home",
            Nature: "chat",
            ObjectOfRequest: "decline invitation2",
            toUser: partGroup[0],
            Message: partGroup[partGroup.length-1]
        };

        sendMessageToWebsocket(ws, request)
        setInvitations2(inviations2.filter((value)=> value !== group))
    }

    const setText=(value)=>{
        setMessage(value)
    }

    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [errorSearchGroup, seterrorSearchGroup] = useState("")
    const [messageSucess, setMessageSuccess] = useState("")

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.length > 0) {
            const filteredSuggestions = allGroups.filter(group =>
                group.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion);
        setSuggestions([]);
    };

    const joinGroup = ()=>{
        if (allGroups.includes(searchTerm)){
            const formGroup = new FormData();
            formGroup.append("group", searchTerm)
            formGroup.append("token", user.UUID)
            formGroup.append("nature", "join a group")

            sendFormToBack("/api/home", formGroup)
            setMessageSuccess("Request send")
            setTimeout(()=>{
                setMessageSuccess("")
            },4000)

        }else{
            seterrorSearchGroup("ERROR: group name doesn't exist")
            setTimeout(()=>{
                seterrorSearchGroup("")
            },4000)
        }
    }


    onMessageWS()

    return (
        <div className={styles.overlay}>
            <div className={styles.settingsContainer}>
                <div className={styles.buttonContainer}>
                    <button className={styles.closeButton} onClick={onClose}>X</button>
                    <button className={styles.createGroup} onClick={creaGroupSet}>Create a group</button>
                </div>
                {creaGroup && users && (<CreateGroup users={users} ws={ws} setGroups={setGroups} close={creaGroupSet} />)}
                <div className={styles.center}>
                    <div className={styles.usersList}>
                        <>
                            {allGroups && !creaGroup && allGroups.length > 0 && (
                                <div className={styles.searchGroupContainer}>
                                    <div>Search a group:</div>
                                    <input
                                        type="text"
                                        placeholder="Subscribe to a group"
                                        className={styles.searchGroupInput}
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                    {suggestions.length > 0 && (
                                        <div className={styles.suggestionsList}>
                                            {suggestions.map((suggestion, index) => (
                                                <div
                                                    key={index}
                                                    className={styles.suggestionItem}
                                                    onClick={() => handleSuggestionClick(suggestion)}
                                                >
                                                    {suggestion}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {errorSearchGroup && (<div className={styles.error}>{errorSearchGroup}</div>)}
                                    {messageSucess && <div className={styles.messageSuccess}> {messageSucess} </div>}
                                    <button className={styles.searchGroupButton} onClick={joinGroup}>Request</button>
                                </div>
                            )}
                        </>
                        <>
                            {groups && !creaGroup && groups.length > 0 ? (
                                <>
                                <div>-_--_-_--_---_-__--__-__-_--_--_-_--__--</div>
                                    <div className={styles.containGroup}>
                                        <div className={styles.center}>Groups:</div>
                                        {groups.map((group, groupIndex) => (
                                            <>
                                                <div key={groupIndex} className={styles.groupContainer}>
                                                <button className={styles.groupName} onClick={() => seeGroupOnClick(group.Name)}>{group.Name}</button>
                                                    {notification && notification.filter((value) => value.nickname === group.Name).length > 0 ? (
                                                        <div className={styles.newMessages}>
                                                            New message({notification.find((value) => value.nickname === group.Name).num})!!!
                                                        </div>
                                                    ) : null}
                                                </div>
                                                {seeGroup.Name && seeGroup.Name == group.Name && ws && (
                                                    <ChatWindowGroup user={user} ws={ws} groupSelect={seeGroup} setNotification={setNotification}/>
                                                )}
                                            </>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                null
                            )}
                        </>

  
                        {!creaGroup && (invitations && invitations.length >0) ? (
                            <>
                            <div>-_--_-_--_---_-__--__-__-_--_--_-_--__--</div>
                            {invitations.map((group, index) => (
                                <div className={styles.containGroup}>
                                <div className={styles.invitationTitle}>Group Invitations:</div>
                                <div key={index} className={styles.invitationItem}>
                                    <div className={styles.invitationGroupName}>{group}</div>
                                    <div className={styles.invitationButtons}>
                                        <button
                                            className={`${styles.invitationButton} ${styles.acceptButton}`}
                                            onClick={() => handleAccept(group)}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className={`${styles.invitationButton} ${styles.declineButton}`}
                                            onClick={() => handleDecline(group)}
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </div>
                                </div>
                            ))}
                            </>
                        ): (
                        null
                        )}
                        {!creaGroup && (inviations2 && inviations2.length >0) ? (

                            <>
                                {inviations2.map((group, index) => (
                                    <div className={styles.containGroup}>
                                    <div className={styles.invitationTitle}>Users want join a group:</div>
                                    <div key={index} className={styles.invitationItem}>
                                        <div className={styles.invitationGroupName}>{group}</div>
                                        <div className={styles.invitationButtons}>
                                            <button
                                                className={`${styles.invitationButton} ${styles.acceptButton}`}
                                                onClick={() => handleAccept2(group)}
                                            >
                                                Accept
                                            </button>
                                            <button
                                                className={`${styles.invitationButton} ${styles.declineButton}`}
                                                onClick={() => handleDecline2(group)}
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                    </div>
                                ))}
                            </>
                        ): (
                        null
                        )}
                  

                        <div>
                            {users && connectUsers && !creaGroup && (
                                <div>
                                    <div>-_--_-_--_---_-__--__-__-_--_--_-_--__--</div>
                                    <div className={styles.center}>Users:</div>
                                    {users.map((userTchat, index) => (
                                        <div key={index}>
                                            <div className={styles.connectedUser} onClick={() => openChatWithUser(userTchat.Nickname)}>
                                                <div className={styles.userAvatar}>
                                                    <img src={userTchat.UrlImage} alt="avatar" />
                                                </div>
                                                <div className={styles.userNickname}>
                                                    <div className={isUserConnected(userTchat.Nickname) ? styles.pointVert : styles.pointNoir}></div>
                                                    {userTchat.Nickname}
                                                    {notification && notification.filter((value) => value.nickname === userTchat.Nickname).length > 0 && (
                                                        <div className={styles.newMessages}>
                                                            New message({notification.find((value) => value.nickname === userTchat.Nickname).num})!!!
                                                        </div>
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
                                                                            <p>{message.Date.split(':').slice(0, 2).join(':')}</p>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            ))}
                                                            {notSub === openChat.nickname && (
                                                                <div className={styles.notSub}>You're not subscribed to this user Or he doesn't follow you</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className={styles.center}>
                                                        <EmojiPickerComponent text={message} setText={setText}/>
                                                        <input type="text" className={styles.chatInput} value={message} id="message" onChange={messageIsWritting} placeholder="Type a message..." onKeyDown={handleKeyPress} />
                                                       
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Tchat;
