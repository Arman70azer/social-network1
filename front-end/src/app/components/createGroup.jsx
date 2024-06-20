import React, { useState } from 'react';
import styles from '../styles/tchat.module.css';
import cookieExist from '../utils/cookieUserExist';
import sendMessageToWebsocket from '../lib/wsSendMessage';

function CreateGroup({ users, ws, setGroups, close }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [error, setErr] = useState("")
    const [newGroup, setNewGroup] = useState("")

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleNewGroup =(e)=>{
        setNewGroup(e.target.value)
    }

    const handleAddUser = (userNickname) => {
        const user = users.find((u) => u.Nickname === userNickname);
    
        if (!user) {
            setErr('User not found');
            setSearchTerm(''); // Clear search term after adding a user
            return;
        }
    
        const userAlreadySelected = selectedUsers.some((selectedUser) => selectedUser.Nickname === userNickname);
        if (!userAlreadySelected) {
            setSelectedUsers((prevSelectedUsers) => [...prevSelectedUsers, user]);
        }
        setSearchTerm(''); // Clear search term after adding a user
    };

    const filteredUsers = users.filter((user) =>
        user.Nickname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const removeFromUserSelect = (userNickname) => {
        setSelectedUsers((prevSelectedUsers) =>
            prevSelectedUsers.filter((user) => user.Nickname !== userNickname)
        );
    };

    const sendGroupChat=()=>{

        if (newGroup!== "" && selectedUsers && selectedUsers.length>0){
            const request = {
                User: cookieExist(),
                Origin: "chat-home",
                Nature: "chat",
                ObjectOfRequest: "new group",
                Message: newGroup,
                Users: selectedUsers
            };
            sendMessageToWebsocket(ws, request)
        }else{
            setErr("ERROR: name of group doesn't exist or no selected users")
            setTimeout(()=>{
                setErr("")
            }, 5000)
        }
    }

    const onMessageWS = async () => {
        if (ws && cookieExist()){
            ws.onmessage = (event) => {
                const receivedMessage = JSON.parse(event.data); // Convertir la chaîne JSON en objet JavaScript
                if (!receivedMessage.Accept && (receivedMessage.ObjectOfRequest === "new group")) {
                    setErr(receivedMessage.Message)
                    setTimeout(()=>{
                        setErr("")
                    }, 5000)
                }else if (receivedMessage.Accept && receivedMessage.ObjectOfRequest === "new group"){
                    setGroups(receivedMessage.Tchat.Group)
                    close()
                }
            }
        }
    }

    onMessageWS()

    return (
        <div className={styles.contains_creaGroup}>
            <div>
                <label htmlFor="groupName">Choose name group:</label>
                <input type="text" id="groupName" value={newGroup} onChange={handleNewGroup} />
            </div>
            <div>
                <label htmlFor="searchUser">Add users to group:</label>
                <input
                    type="text"
                    placeholder="user"
                    id="searchUser"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                {searchTerm && (
                    <div className={styles.userSuggestions}>
                        {filteredUsers.map((user, index) => (
                            <div
                                key={index}
                                className={styles.userSuggestion}
                                onClick={() => handleAddUser(user.Nickname)}
                            >
                                {user.Nickname}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {error && (<div className={styles.error}> {error} </div>)}
            <button onClick={(e) => sendGroupChat(e)}>Create</button>
            <div className={styles.selectedUsers}>
                {selectedUsers.map((user, index) => (
                    <div key={index} className={styles.selectedUser}>
                        <span>{user.Nickname}<button onClick={() => removeFromUserSelect(user.Nickname)}>X</button></span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CreateGroup;
