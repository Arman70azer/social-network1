"use client"
import DashboardTop from "../components/dashboard"
import styles from "../styles/createPost.module.css"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import fetchUsersAndPosts from "../lib/fetPosts"

//permet de retourner sur la page d'acceuil

export default function Page(){

    const [data, setPosts] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            // Récupérer les données des posts
            const datafetch = await fetchUsersAndPosts();
            setPosts(datafetch);
        };

        fetchData();
          // Mettre à jour les suggestions une seule fois
    }, []);
    
    const router = useRouter();
    const [formData, setFormData] = useState({
        content: '',
        typePost: 'Public',
        file: null,
        users: [],
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

        if (formData.content){
            if (fileValid){
        
                // Créer un objet FormData pour envoyer le formulaire avec le fichier
                const formDataToSend = new FormData();
                formDataToSend.append('content', formData.content);
                formDataToSend.append('typePost', formData.typePost);
                formDataToSend.append('user', "Arman")
                if (formData.file) {
                    formDataToSend.append('file', formData.file); // Ajouter le fichier
                }

                if (formData.typePost === "Private"){
                    formDataToSend.append('users', formData.users)
                }

                // Envoyer les données du formulaire à l'URL souhaitée
                try {
                    const response = await fetch('http://localhost:8000/createPost', {
                        method: 'POST',
                        body: formDataToSend
                    });

                    // Vérifiez si la réponse est réussie (statut 200)
                    if (response.ok) {
                        // Rediriger l'utilisateur vers la page d'accueil
                        router.push('/home');
                    } else {
                        console.error('Erreur lors de l\'envoi du formulaire:', response.statusText);
                    }
                } catch (error) {
                    console.error('Error submitting form:', error);
                }
            }
        }else{
            setPresentContent(false)
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
            <DashboardTop/>
            <div className={styles.center}>
                <form className={styles.menuNewPost}>
                    Write New Post :
                    <input type="file" className={styles.file} name="file" onChange={handleFile}/>
                    {!fileValid && <span id="errorTypeFile" className={styles.error}>This file is not a image</span>}
                    <textarea className={styles.textarea} name="content" id="content" cols="30" rows="10" placeholder="Description and Hashtags(#)" value={formData.content} onChange={handleChange}></textarea>
                    <label className={styles.select} htmlFor="typePost">Type de publication :</label>
                    <select name="typePost" id="typePost" value={formData.typePost} onChange={handleChange}>
                        <option value="Public">Public</option>
                        <option value="Private">Private (followers only)</option>
                    </select>

                    {formData.typePost === 'Private' && (
                    <div className={styles.allUserForPrivate}>
                        <input
                        type="text"
                        placeholder="Rechercher un utilisateur"
                        id="searchPrivate"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        />
                        <button onClick={(e) => handleAddUser(e)}>Ajouter</button>
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
                </form>
            </div>
        </div>
    );
}