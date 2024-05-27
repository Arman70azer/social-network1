import React from "react";

const HomePage = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <head style={{ color: "#1877f2", fontSize: "36px" }}>
          Welcome to Social Network
        </head>
        <p style={{ color: "#606770", fontSize: "24px" }}>Page login</p>
      </div>
      <div
        className="carte"
        style={{
          backgroundColor: "#ffffff",
          width: "300px",
          padding: "20px",
          boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.5)",
        }}
      >
        <form>
          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="pseudo">Pseudo:</label>
            <input type="text" id="pseudo" name="pseudo" />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="nom">Nom:</label>
            <input type="text" id="nom" name="nom" />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="prenom">Prénom:</label>
            <input type="text" id="prenom" name="prenom" />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="dateNaissance">Date de naissance:</label>
            <input type="date" id="dateNaissance" name="dateNaissance" />
          </div>
          <button type="submit" className="button-login">
            Login
          </button>
          <button type="submit" className="button-register">
            Registedsfdfsfdfsdfsdfdsdsfdsfsdfdfdfsd
          </button>
        </form>
      </div>
    </div>
  );
};

export default HomePage;
