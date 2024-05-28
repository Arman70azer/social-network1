"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "../styles/register.module.css";

export default function Register() {
  const [formData, setFormData] = useState({
    nickname: "",
    firstname: "",
    lastname: "",
    birthday: "",
    age: "",
    imagename: "",
    aboutme: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({
        ...formData,
        [name]: files[0],
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

    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        formDataToSend.append(key, formData[key]);
      }

      const response = await fetch("/api/register", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        alert("Inscription réussie!");
      } else {
        alert("Erreur lors de l'inscription");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'inscription");
    }
  };

  return (
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
            required
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="nickname" className={styles.label}>
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
          <label htmlFor="nickname" className={styles.label}>
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
          <label htmlFor="nickname" className={styles.label}>
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
            required
            className={styles.input}
            accept="image/*"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="nickname" className={styles.label}>
            About Me
          </label>
          <input
            type="text"
            id="aboutme"
            name="aboutme"
            value={formData.aboutme}
            onChange={handleChange}
            required
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

        <button type="submit" className={styles.button}>
          S'inscrire
        </button>
      </form>
      <p className={styles.link}>
        Vous avez déjà un compte ? <Link href="/login">Se connecter</Link>
      </p>
    </div>
  );
}
