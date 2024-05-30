"use client"
import { useEffect, useState } from "react";
import DashboardTop from "../components/dashboard";
import fetchDataHome from "../lib/fetchDataHome";
import openWebSocketConnexion from "../lib/websocket"
import styles from "../styles/profil.module.css"
import eventUpdate from "../utils/eventUpdate"

let wssocket;
export default function page(){
    const [data, setData] = useState([])
    const user = "Arman"
    const [isLoading, setLoading] = useState(true)
    const [userInfo, setUserInfo] = useState({
        ID:0,
        Nickname:"",
        Email: "",
        Password:"",
        FirstName: "",
        LastName: "",
        Birthday: "",
        Age: 0,
        ImageName: "",
        UrlImage: "",
        AboutMe: "",
        UUID: "",
        Followers: []
    })

    useEffect(() => {
       
        const fetchData = async () => {
            // Récupérer les données des posts
            const datafetch = await fetchDataHome();
            setData(datafetch);
            setUserInfo(datafetch.Users[0])
            console.log(datafetch.Users[0])
        };

        // Appeler la fonction qui effectue le fetch et la gestion du WebSocket
        fetchData();
        
        wssocket = openWebSocketConnexion(user);

        setTimeout(()=>{
            setLoading(false)
        },500)
    }, []);

    const onMessageWS = () => {
        if (data && wssocket!= null) {
            // Gérer les messages reçus du serveur WebSocket
            wssocket.onmessage = (event) => {
                const receivedMessage = JSON.parse(event.data); 
                if (receivedMessage.Accept && receivedMessage.Event){
                    const eventTarget = eventUpdate(data.Events, receivedMessage)
                    setData(prevData => {
                        const updateEvents = prevData.Events.map(event => {
                            if (event.Titre === eventTarget.Titre) {
                                return eventTarget;
                            } else {
                                return event;
                            }
                        });
                        return { ...prevData, Events: updateEvents };
                    });
                    console.log(data.Events[0].Followers)
                }
            }
        }
    }

    onMessageWS()

    return(
        <div>
            {data.Events && wssocket!= null ? <DashboardTop events={data.Events} ws={wssocket} /> : <DashboardTop />}

            {userInfo.Nickname != "" && !isLoading ? 
             <div className={styles.Content}>
                {userInfo.Nickname}dssdds
            </div>
            :
            <div className={styles.overlay}>
                <div className={styles.loader}></div>
                <p>Load of profile data...</p>
            </div>
            }
            
        </div>
    )
}