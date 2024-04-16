import React from "react";

const HomePage = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        justifyContent: "space-between",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1>WELCOME TO SOCIAL-NETWORK</h1>
        <p>Page login </p>
      </div>
      <div style={{ textAlign: "center" }}>
        <button className="button-login">Cliquez ici</button>
        <button className="button-register">Cliquez ici</button>
      </div>
    </div>
  );
};

export default HomePage;
