"use client"
import DashboardTop from "../components/dashboard"
import styles from "../styles/createPost.module.css"
import { useState } from 'react';

export default function Page(){
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        typePost: 'Public'
    });

    const handleSubmit = async (event) => {
        event.preventDefault(); // Empêcher le comportement par défaut du formulaire
        
    
        // Envoyer les données du formulaire à l'URL souhaitée
        try {
            const response = await fetch('http://localhost:8000/createPost', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData) // Convertir en JSON
            });
            
            // Gérer la réponse si nécessaire
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };
    

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    return (
        <div>
            <DashboardTop/>
            <div className={styles.center}>
                <form className={styles.menuNewPost} encType="multipart/form-data" onSubmit={handleSubmit}>
                    Write New Post :
                    <input className={styles.inputTitle} name="title" type="text" placeholder="Title" value={formData.title} onChange={handleChange}/>
                    <input type="file" className={styles.file} name="file"/>
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