
import React from "react";
import logo from "../assets/tslogo.png";
import "./Welcome.css";
 
const Welcome = () => {
  return (
    <div className="welcome-wrapper"> {/* Added wrapper here */}
      <div style={styles.container}>
        <div className="textSection">
          <h1 className="left-heading">
            Seamless migration starts with databases.
          </h1>
          <p className="left-subcaption">
            Migrate from MongoDB to Couchbase with speed, trust, and security.
          </p>
        </div>
 
        <div style={styles.logoSection}>
          <img src={logo} alt="Techstars Logo" className="logo fadeIn" />
          <div className="label-under-logo">Center of Excellence</div>
        </div>
      </div>
    </div>
  );
};
 
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    color: "#333",
    padding: "2rem",
    gap: "4rem",
    flexWrap: "wrap",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  logoSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "2rem",
  },
};
 
export default Welcome;
 