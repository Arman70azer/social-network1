import React from "react";

const HomePage = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f2f5",
        padding: "20px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1 style={{ color: "#1877f2" }}>Welcome to Social Network</h1>
        <p style={{ color: "#606770" }}>Page login</p>
      </div>
      <div style={{ textAlign: "left", maxWidth: "300px", margin: "0 auto" }}>
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
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default HomePage;
