import { useEffect, useState } from "react";
import fetchDataHome from "../lib/fetchDataHome";
import styles from "../styles/tchat.module.css"
import sendMessageToWebsocket from "../lib/wsSendMessage";

function NewMember({ user, ws, group }) {
    const [users, setUsers] = useState([]);
    const [userChoose, setUserChoose] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [messageSucess, setMessageSuccess] = useState("")

    useEffect(() => {
        const fetchData = async () => {
                const datafetch = await fetchDataHome(); // Supposons que fetchDataHome récupère les données des utilisateurs

                let membres = []

                for(let i = 0;i< group.Members.length;i++){
                    membres.push(group.Members[i].Nickname)
                }

                setUsers(datafetch.Users.filter((value)=> !membres.includes(value.Nickname)));
      
        };

        fetchData(); // Appeler la fonction fetchData pour récupérer les données des utilisateurs
    }, []);

    useEffect(() => {
        // Filtrer les utilisateurs en fonction de ce qui est écrit dans l'input
        if (userChoose.trim() === "") {
            setFilteredUsers([]);
        } else {
            const filtered = users.filter((user) =>
                user.Nickname.toLowerCase().includes(userChoose.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [userChoose, users]);

    const isWritting = (value) => {
        setUserChoose(value);
    };
    const sendRequestNewMember=(event)=>{
        if (event.key === 'Enter') {
            const request = {
                User: user.UUID,
                Origin: "chat-home",
                Nature: "chat",
                ObjectOfRequest: "new member",
                ToUser: userChoose,
                Message: group.Name,
            };
            sendMessageToWebsocket(ws, request)
            setUserChoose("")
            setMessageSuccess("request send!!!")
        }
    }

    return (
        <div className={styles.center}>
            <div className={styles.groupAddUserContainer}>
                <input
                    type="text"
                    value={userChoose}
                    onChange={(e) => isWritting(e.target.value)}
                    onKeyDown={sendRequestNewMember}
                    placeholder="Search user by nickname..."
                />
                {messageSucess && <div className={styles.messageSuccess}> {messageSucess} </div>}
                {/* Afficher les utilisateurs filtrés */}
                {filteredUsers.length > 0 && (
                    <div className={styles.userList}>
                        {filteredUsers.map((user, index) => (
                            <div key={index} className={styles.userItem}>
                                <div className={styles.userInfo} onClick={() =>isWritting(user.Nickname)}>
                                    <div className={styles.avatar}>
                                        {/* Placeholder pour l'avatar, à remplacer par une image réelle */}
                                        <img src={user.UrlImage} alt="avatar" />
                                    </div>
                                    <p>{user.Nickname}</p>
                                    {/* Afficher d'autres informations si nécessaire */}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default NewMember;
