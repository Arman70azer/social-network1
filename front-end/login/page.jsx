"use client"

import googleimg from "./img/google.jpg"
import githubimg from "./img/github.jpg"
import Image from "next/image";

export default function Form(){
return (
<form className="my-form" onSubmit={handleSubmit}>
              <div className="form-welcome-row">
                <h1>Fais ton Compte &#x1F44F;</h1>
              </div>
              <div className="socials-row">
                <a href="#" title="Use Google">
                  <Image src={googleimg} width={24} height={24} alt="Google" />
                  Goggle
                </a>
                <a href="#" title="Use Github">
                  <Image src={githubimg} width={24} height={24} alt="Github" />
                   Github
                </a>
              </div>
              <div className="divider">
                <div className="divider-line"></div> ou <div className="divider-line"></div>
              </div>
              <div className="text-field">
                <label htmlFor="email">Email:
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="off"
                    placeholder="Ton Email"
                    required
                  />
                </label>
              </div>
              <div className="text-field">
                <label htmlFor="password">Password:
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Ton Password"
                    title="Minimum 6 characters with at least 1 Alphabet and 1 Number"
                    pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$"
                    required
                  />
                </label>
              </div>
              <button type="submit" className="my-form__button">Viens connecte toi</button>
              <div className="my-form__actions">
                <a href="#" title="Reset Password">
                  Reset Password
                </a>
                <a href="#" title="Create Account">
                  Already have an account?
                </a>
              </div>
            </form>
            )
}


const handleSubmit = async (event) => {
    console.log("APPUYEEE")
    event.preventDefault();
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Connexion réussie', data);
        // Gérer la logique post-connexion ici, comme rediriger l'utilisateur
      } else {
        console.error('Échec de la connexion', data.message);
        // Afficher un message d'erreur
      }
    } catch (error) {
      console.error('Erreur de connexion', error);
    }
  };