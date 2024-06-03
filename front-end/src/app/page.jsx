"use client";
import { useState } from "react";
import sendFormAndReceiveData from "./lib/sendForm&ReceiveData";
import Cookies from "js-cookie";

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
            Cookies.set('token', data.token, { expires: 1 }); // expire dans 7 jours
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
  return (
    <div>
      <div className="form-wrapper">
        <div className="form-side">
          <form className="my-form" onSubmit={sendForm}>
            <div className="form-welcome-row">
              <h1>Connexion</h1>
            </div>
            <div className="text-field">
              <label htmlFor="emailOrNickname">
                Email or Nickname:
                <input
                  type="text"
                  id="emailOrNickname"
                  name="emailOrNickname"
                  autoComplete="off"
                  onChange={handleChange}
                  placeholder="Email or Nickname"
                  required
                />
              </label>
            </div>
            <div className="text-field">
              <label htmlFor="password">
                Password:
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  required
                />
              </label>
            </div>
            {form.emailOrNickname && form.password && (
              <div>{form.password}-{form.emailOrNickname}</div>
            )}
            <button type="submit" className="my-form__button">Login</button>
            {message && <div className={error ? "error" : "success"}>{message}</div>}
            <div className="my-form__actions">
              <a href="#" title="Reset Password">
                Reset Password
              </a>
              <a href="/register" title="Create Account">
                Create Account
              </a>
            </div>
          </form>
        </div>
        <div className="info-side">
          <img src="/assets/mock.png" width={300} height={200} alt="Mock" className="mockup" />
        </div>
      </div>
    </div>
  );
}