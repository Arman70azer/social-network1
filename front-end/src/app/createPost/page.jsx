"use client"
import DashboardTop from "../components/dashboard"
import styles from "../styles/createPost.module.css"
import { useState } from 'react';

export default function Page(){
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        typePost: 'Public',
        file: null
    });

    const [fileValid, setFileValid] =useState(true)

    const handleSubmit = async (event) => {
        event.preventDefault(); // Empêcher le comportement par défaut du formulaire

        if (fileValid){
    
            // Créer un objet FormData pour envoyer le formulaire avec le fichier
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('content', formData.content);
            formDataToSend.append('typePost', formData.typePost);
            // Ajouter le fichier s'il existe
            if (formData.file) {
                formDataToSend.append('file', formData.file); // Ajouter le fichier
            }

            // Envoyer les données du formulaire à l'URL souhaitée
            try {
                const response = await fetch('http://localhost:8000/createPost', {
                    method: 'POST',
                    body: formDataToSend
                });
                
                // Gérer la réponse si nécessaire
            } catch (error) {
                console.error('Error submitting form:', error);
            }
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

    return (
        <div>
            <DashboardTop/>
            <div className={styles.center}>
                <form className={styles.menuNewPost} onSubmit={handleSubmit}>
                    Write New Post :
                    <input className={styles.inputTitle} name="title" type="text" placeholder="Title" value={formData.title} onChange={handleChange}/>
                    <input type="file" className={styles.file} name="file" onChange={handleFile}/>
                    {!fileValid && <span id="errorTypeFile" className={styles.error}>This file is not a image</span>}
                    <textarea className={styles.textarea} name="content" id="content" cols="30" rows="10" placeholder="Description and Hashtags(#)" value={formData.content} onChange={handleChange}></textarea>
                    <label className={styles.select} htmlFor="typePost">Type de publication :</label>
                    <select name="typePost" id="typePost" value={formData.typePost} onChange={handleChange}>
                        <option value="Public">Public</option>
                        <option value="Private">Private</option>
                    </select>
                    <button className={styles.buttonForm} type="submit">Publish</button>
                </form>
            </div>
        </div>
    );
}