"use client"
import DashboardTop from "../components/dashboard"
import styles from "../styles/createPost.module.css"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import fetchUsersAndPosts from "../lib/fetPosts"
import openWebSocketConnexion from "../lib/websocket";
import sendRequestToWebsocket from "../lib/wsSendMessage"
import sendFormToBack from "../lib/sendFormToBack";

//permet de retourner sur la page d'acceuil

let wsConnect;
export default function Page(){

    const [data, setPosts] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [correctForm, setCorrectForm] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            // Récupérer les données des posts
            const datafetch = await fetchUsersAndPosts();
            setPosts(datafetch);
        };

        fetchData();

        wsConnect = openWebSocketConnexion()
        setTimeout(() => {
            sendRequestToWebsocket(wsConnect, { Origin: "creationPost", Nature: "enterToCreationPost", User:"Arman" });
        }, 200);
     
          // Mettre à jour les suggestions une seule fois
    }, []);
    
    const router = useRouter();
    const [formData, setFormData] = useState({
        content: '',
        type: 'Public',
        file: null,
        users: [],
        nature: 'Post',
        title:'',
        eventDate:''
    });

    const handleAddUser = (event) => {
        event.preventDefault();
        if (searchTerm && !formData.users.includes(searchTerm)) {
            for (let i = 0; i< data.Users.length; i++){
                if (data.Users[i].Nickname === searchTerm){
                    setFormData({
                        ...formData,
                        users: [...formData.users, searchTerm]
                    });
                    break
                }
            }
        }
        setSearchTerm(''); // Efface le champ de recherche après l'ajout
        setSuggestions([])
    };    

    // Fonction pour mettre à jour la barre de recherche et les suggestions
    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);

        if (searchTerm != ""){
            // Filtrer les suggestions basées sur le terme de recherche et limiter à trois résultats
            const filteredSuggestions = data.Users.filter(user =>
                user.Nickname.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 3);
            setSuggestions(filteredSuggestions);
        }else{
            setSuggestions([])
        }
    };


    const [fileValid, setFileValid] =useState(true)
    const [contentPresent, setPresentContent] = useState(true)

    const handleSubmit = async (event) => {
        event.preventDefault(); // Empêcher le comportement par défaut du formulaire
        let correct = true

        if (formData.content){
            if (fileValid){
        
                // Créer un objet FormData pour envoyer le formulaire avec le fichier
                const formDataToSend = new FormData();
                formDataToSend.append('content', formData.content);
                formDataToSend.append('type', formData.type);
                formDataToSend.append('user', "Arman")
                formDataToSend.append('nature', formData.nature)
                formDataToSend.append('title', formData.title)
                formDataToSend.append('eventDate', formData.eventDate)

                if (formData.nature === "Event"){
                    if (formData.title !== "" && formData.eventDate !== ""){
                        console.log(formData, formData.eventDate)
                        correct = true
                    }else{
                        correct = false
                    }
                }

                if (formData.file) {
                    formDataToSend.append('file', formData.file); // Ajouter le fichier
                }

                if (formData.type === "Private"){
                    formDataToSend.append('users', formData.users)
                }

                // Envoyer les données du formulaire à l'URL souhaitée
                if (correct){
                   sendFormToBack("/createPost", formDataToSend)
                   window.location.href = '/home'
                }
            }
        }else{
            setPresentContent(false)
        }
        if (!correct){
            setCorrectForm(false)
        }else{
            setCorrectForm(true)
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleFile = (event) => {
        const fileImage = event.target.files[0]; // Obtenir le fichier
        setFormData({
            ...formData,
            file: fileImage
        });

        // Vérifier le type de fichier
        if (fileImage) {
            const fileType = fileImage.type;
            if (fileType.startsWith('image/')||fileImage===null) {
                setFileValid(true);
            } else {
                setFileValid(false);
            }
        }
    };

    const handleRemoveUser = (userId) => {
        setFormData({
            ...formData,
            users: formData.users.filter((user) => user !== userId)
        });
    };

    return (
        <div>
           {data.Events ? <DashboardTop events={data.Events} ws={wsConnect}/> : <DashboardTop />}
            <div className={styles.center}>
                <form className={styles.menuNewPost}>
                    <label htmlFor="nature">Write New {formData.nature}:</label>
                    <select name="nature" id="nature" value={formData.nature} onChange={handleChange}>
                        <option value="Post">Post</option>
                        <option value="Event">Event</option>
                    </select>
                    {formData.nature === 'Event' && (
                        <div>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                style={{ border: '2px solid black', padding: '5px', borderRadius: '4px', marginTop: '20px' }}
                                placeholder="Title"
                            />
                            <input 
                                type="datetime-local"
                                id="eventDate"
                                name="eventDate"
                                value={formData.eventDate}
                                onChange={handleChange}
                                style={{ border: '2px solid black', padding: '5px', borderRadius: '4px', marginTop: '20px' }}
                            />
                        </div>
                    )}

                    <input type="file" className={styles.file} name="file" onChange={handleFile}/>
                    {!fileValid && <span id="errorTypeFile" className={styles.error}>This file is not a image</span>}
                    <textarea className={styles.textarea} name="content" id="content" cols="30" rows="10" placeholder="Description and Hashtags(#)" value={formData.content} onChange={handleChange}></textarea>
                    <label className={styles.select} htmlFor="type">Type de publication :</label>
                    <select name="type" id="type" value={formData.type} onChange={handleChange}>
                        <option value="Public">Public</option>
                        <option value="Private">Private (followers only)</option>
                    </select>

                    {formData.type === 'Private' && (
                    <div className={styles.allUserForPrivate}>
                        <input
                        type="text"
                        placeholder="No followers"
                        id="searchPrivate"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        />
                        <button onClick={(e) => handleAddUser(e)}>Add</button>
                        <label htmlFor="searchPrivate">
                            
                            {/* Afficher les suggestions filtrées */}
                            {suggestions.map((user, index) => (
                                <li key={index}>{user.Nickname}</li>
                            ))}
                            
                        </label>
                        {formData.users && formData.users.map((user) => (
                        <div key={user} className={styles.margeCrossUser}>
                            {user}
                            <button onClick={() => handleRemoveUser(user)}>X</button>
                        </div>
                        ))}
                    </div>
                    )}

                    <br />

                    <button className={styles.buttonForm} type="submit" onClick={handleSubmit}>Publish</button>
                    {!contentPresent && <span id="errorTypeFile" className={styles.error}>No content</span>}
                    {!correctForm && <span id="errorForm" className={styles.error}>Bad information or formulaire not complete {formData.eventDate}</span>}
                </form>
            </div>
        </div>
    );
}