// pages/register.js
"use client";
import Link from "next/link";
import { useState } from "react";
import styles from "../styles/register.module.css";
import sendFormToBackAndReceive from "../lib/sendForm&ReceiveData";
export default function Register() {
  const [error, setError] = useState({
    exist: false,
    message:""
  })
  const [formData, setFormData] = useState({
    nickname: "",
    firstname: "",
    lastname: "",
    birthday: "",
    imagename: "",
    aboutme: "",
    email: "",
    password: "",
  });
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imagename") {
      setFormData({
        ...formData,
        [name]: files[0], // Si c'est une image, utilisez files[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    const form = new FormData();
    form.append("nickname", formData.nickname);
    form.append("firstname", formData.firstname);
    form.append("lastname", formData.lastname);
    form.append("birthday", formData.birthday);
    form.append("imagename", formData.imagename);
    form.append("aboutme", formData.aboutme);
    form.append("email", formData.email);
    form.append("password", formData.password);
    const response = await sendFormToBackAndReceive("/register", form);
    if (response.Accept){
      window.location.href = '/'
    }else{
      setError({
        exist : true,
        message : response.Nature,
      })
    }
  };
  return (
    <div className={styles.page}>
      <div className={styles.pageContent}>
        <div className={styles.container}>
          <h1 className={styles.header}>Inscription</h1>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="nickname" className={styles.label}>
                Nom d'utilisateur
              </label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="firstname" className={styles.label}>
                First Name
              </label>
              <input
                type="text"
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="lastname" className={styles.label}>
                Last Name
              </label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="birthday" className={styles.label}>
                Birthday
              </label>
              <input
                type="date"
                id="birthday"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="imagename" className={styles.label}>
                Image
              </label>
              <input
                type="file"
                id="imagename"
                name="imagename"
                onChange={handleChange}
                className={styles.input}
              />
              <button type="reset" className={styles.button}>
                reset
              </button>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="aboutme" className={styles.label}>
                About Me
              </label>
              <input
                type="text"
                id="aboutme"
                name="aboutme"
                value={formData.aboutme}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
            {error.exist && (<div className={styles.error}>{error.message}</div>)}
            <button type="submit" className={styles.button}>
              S'inscrire
            </button>
          </form>
          <p className={styles.link}>
            Vous avez déjà un compte ? <Link href="/">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
