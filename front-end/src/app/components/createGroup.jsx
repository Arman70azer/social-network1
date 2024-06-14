import React, { useState } from 'react';
import styles from '../styles/tchat.module.css';

function CreateGroup({ users }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [error, setErr] = useState("")

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

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

    return (
        <div className={styles.contains_creaGroup}>
            <div>
                <label htmlFor="groupName">Choose name group:</label>
                <input type="text" id="groupName" />
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
            <button onClick={(e) => handleAddUser(e)}>Add</button>
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
