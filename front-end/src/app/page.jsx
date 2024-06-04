"use client";
import { useState } from "react";
import sendFormAndReceiveData from "./lib/sendForm&ReceiveData";
import Cookies from "js-cookie";

import "../app/styles/connexions.css"; 
import "../app/styles/styles.css"; 
import test from '../app/assets/toufik.jpeg'; 
import t from '../app/assets/armand.jpg'; 
import tt from '../app/assets/alex.webp'; 
import ttt from '../app/assets/brad.jpg'; 
import tttt from '../app/assets/cypri.jpg'; 

export default function Page() {
  const [form, setForm] = useState({
    emailOrNickname: "",
    password: ""
  });
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({
      ...form,
      [name]: value
    });
  };
  const sendForm = async (event) => {
    event.preventDefault();
    if (form.emailOrNickname !== "" && form.password !== "") {
      const formToSend = new FormData();
      formToSend.append("user", form.emailOrNickname);
      formToSend.append("password", form.password);
      const data = await sendFormAndReceiveData("/api/login", formToSend)
      if (!data.success){
        setMessage(data.message)
        setError(true)
      }else if(data.success){
        setMessage(data.message)
        setError(!data.success)
        if (typeof window !== 'undefined') {
          if (!Cookies.get('token') || Cookies.get('token')!==data.token){
            Cookies.set('token', data.token, { expires: 1 }); // expire dans 1 jour
            Cookies.set('user', data.user, { expires: 1 }); // expire dans 1 jour
          }
          window.location.href = '/home'
        }
      }else{
        setError(true);
        setMessage("Erreur lors de la connexion");
        console.error("Erreur lors de la connexion :", error);
      }
    } else {
      setError(true);
      setMessage("Vous devez entrer un email/pseudo et un mot de passe");
    }
  };

  const profiles = [
    { name: "Toufik Himoum", role: "Développeur Full stack", company: "Google", skills: ["React.js", "Node.js", "CSS", "Game", "Golang", "HTML", "Javascript"], img: test.src, infoLink: "https://www.instagram.com/toufehhh/" },
    { name: "Armand Auvray", role: "Développeur Full stack", company: "Google", skills: ["React.js", "Node.js", "CSS", "Game", "Golang", "HTML", "Javascript"], img: t.src, infoLink: "https://www.instagram.com/arman_auvray/" },
    { name: "Bradley Baptiste", role: "Développeur Full stack", company: "Google", skills: ["React.js", "Node.js", "CSS", "Game", "Golang", "HTML", "Javascript"], img: ttt.src, infoLink: "https://www.twitch.tv/golden_gwada" },
    { name: "Cypriano Escriva", role: "Développeur Full stack", company: "Google", skills: ["React.js", "Node.js", "CSS", "Game", "Golang", "HTML", "Javascript"], img: tttt.src, infoLink: "https://www.police-nationale.interieur.gouv.fr/" },
    { name: "Alex Valin", role: "Développeur Full stack", company: "Google", skills: ["React.js", "Node.js", "CSS", "Game", "Golang", "HTML", "Javascript"], img: tt.src, infoLink: "https://500px.com/p/alexandre-valin?view=photos" },
  ];

  return (
    <div className="form-wrapper">
      <div className="form-side">
        <form className="my-form">
          <div className="form-welcome-row">
            <h1>Fais ton Compte &#x1F44F;</h1>
          </div>
          <div className="socials-row">
            <a href="https://www.google.com/intl/fr/gmail/about/" title="Use Google">
              <img src="../ui/img/google.jpg" width={24} height={24}  />
              Google
            </a>
            <a href="https://github.com/dashboard" title="Use Github">
              <img img ="../ui/img/github.jpg" width={24} height={24}  />
              Github
            </a>
          </div>
          <div className="divider">
            <div className="divider-line"></div> Or <div className="divider-line"></div>
          </div>
          <div className="text-field">
            <label htmlFor="emailOrNickname">Email:
              <input
                type="text"
                id="emailOrNickname"
                name="emailOrNickname"
                autoComplete="off"
                placeholder="Ton Email/Nickname"
                onChange={handleChange}
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
                onChange={handleChange}
                required
              />
            </label>
          </div>
          {error && (<div>{message}</div>)}
          <button type="submit" className="my-form__button" onClick={sendForm}>Login</button>
          <div className="my-form__actions">
            <a href="#" title="Reset Password">
              Reset Password
            </a>
            <a href="#" title="Create Account">
              Already have an account?
            </a>
          </div>
        </form>
      </div>
      <div className="info-side">
        <div className="profile-cards">
          {profiles.map((profile, index) => (
            <article className="card" key={index}>
              <div className="background">
                {profile.img && <img src={profile.img} alt="profile" />}
              </div>
              <div className="content">
                <h2>{profile.name}</h2>
                <p>
                  {profile.role}
                  <a href="https://google.com" title={profile.company}> {profile.company}</a>
                </p>
                <p>Développeur Web :</p>
                <ul className="chips">
                  {profile.skills.map((skill, idx) => (
                    <li className="chip" key={idx}>{skill}</li>
                  ))}
                </ul>
                <div className="action-buttons">
                  <a href={profile.infoLink}>
                    Information
                  </a>
                  <a href="#learn-more" className="secondary">
                    le bouton pour le style
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
