
// // src/Components/Navbar.js
// import React, { useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import { useAuth0 } from "@auth0/auth0-react";
// import "./Navbar.css";

// const Navbar = () => {
//   const location = useLocation();
//   const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

//   const handleLogin = () => {
//     loginWithRedirect({
//       authorizationParams: {
//         redirect_uri: window.location.origin,
//       },
//       appState: {
//         returnTo: location.pathname, // Return to current page after login
//       },
//     });
//   };

//   const handleLogout = () => {
//     logout({
//       logoutParams: {
//         returnTo: window.location.origin,
//       },
//     });
//   };

//   return (
//     <nav className="navbar">
//       <div className="navbar-left">
//         <img
//           src="https://cdn.prod.website-files.com/6393835bb435c428e5b6a54a/6393841f01ab88522a2396b9_Techstar%20Logo%20(1)%20(1).png"
//           alt="Logo"
//           className="navbar-logo"
//         />
//         <h1 className="navbar-title">NoSQL Database Migration</h1>
//       </div>

//       <div className={`navbar-menu ${isMobileMenuOpen ? "active" : ""}`}>
//         {/* Main navigation links */}
//         <Link
//           to="/"
//           className={`navbar-item ${
//             location.pathname === "/" ? "active-link" : ""
//           }`}
//           onClick={() => setMobileMenuOpen(false)}
//         >
//           Dashboard
//         </Link>
//         <Link
//           to="/migration-wizard"
//           className={`navbar-item ${
//             location.pathname === "/migration-wizard" ? "active-link" : ""
//           }`}
//           onClick={() => setMobileMenuOpen(false)}
//         >
//           Migration
//         </Link>
//         <Link
//           to="/settings"
//           className={`navbar-item ${
//             location.pathname === "/settings" ? "active-link" : ""
//           }`}
//           onClick={() => setMobileMenuOpen(false)}
//         >
//           Settings
//         </Link>

//         {/* Auth links */}
//         {isAuthenticated ? (
//           <>
//             <Link
//               to="/profile"
//               className={`navbar-item ${
//                 location.pathname === "/profile" ? "active-link" : ""
//               }`}
//               onClick={() => setMobileMenuOpen(false)}
//             >
//               Profile
//             </Link>
//             <span
//               className="navbar-item logout-link"
//               onClick={handleLogout}
//             >
//               Logout
//             </span>
//           </>
//         ) : (
//           <span
//             className="navbar-item login-link"
//             onClick={handleLogin}
//           >
//             Login
//           </span>
//         )}
//       </div>

//       <div className="mobile-menu-icon" onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
//         <div className={`bar ${isMobileMenuOpen ? "change" : ""}`}></div>
//         <div className={`bar ${isMobileMenuOpen ? "change" : ""}`}></div>
//         <div className={`bar ${isMobileMenuOpen ? "change" : ""}`}></div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;



import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { loginWithRedirect, logout, isAuthenticated, user, getAccessTokenSilently } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: "http://localhost:3000",  // Redirect back to the home page after login
      },
      appState: {
        returnTo: location.pathname, // Return to the current page after login
      },
    });
  };

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,  // Redirect back to the home page after logout
      },
    });
  };

  const handleProfile = async () => {
    try {
      const token = await getAccessTokenSilently();  // Get the Auth0 access token
      console.log("Access Token:", token);
      alert("Access Token: " + token);  // Display the access token (can be used for making secure API calls)
    } catch (error) {
      console.error("Error fetching token:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img
          src="https://cdn.prod.website-files.com/6393835bb435c428e5b6a54a/6393841f01ab88522a2396b9_Techstar%20Logo%20(1)%20(1).png"
          alt="Logo"
          className="navbar-logo"
        />
        <h1 className="navbar-title">NoSQL Database Migration</h1>
      </div>

      <div className={`navbar-menu ${isMobileMenuOpen ? "active" : ""}`}>
        {/* Main navigation links */}
        {/* <Link
          to="/"
          className={`navbar-item ${location.pathname === "/" ? "active-link" : ""}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          Dashboard
        </Link> */}
        <Link
          to="/migration-wizard"
          className={`navbar-item ${location.pathname === "/migration-wizard" ? "active-link" : ""}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          Migration
        </Link>
        <Link
          to="/settings"
          className={`navbar-item ${location.pathname === "/settings" ? "active-link" : ""}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          Settings
        </Link>

        {/* Auth links (Login, Profile, Logout) */}
        {isAuthenticated ? (
          <>
            <Link
              to="/profile"
              className={`navbar-item ${location.pathname === "/profile" ? "active-link" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </Link>
            <span
              className="navbar-item logout-link"
              onClick={handleLogout}
            >
              Logout
            </span>
            <span
              className="navbar-item"
              onClick={handleProfile}
            >
              Get Token
            </span>
          </>
        ) : (
          <span
            className="navbar-item login-link"
            onClick={handleLogin}
          >
            Login
          </span>
        )}
      </div>

      <div className="mobile-menu-icon" onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
        <div className={`bar ${isMobileMenuOpen ? "change" : ""}`}></div>
        <div className={`bar ${isMobileMenuOpen ? "change" : ""}`}></div>
        <div className={`bar ${isMobileMenuOpen ? "change" : ""}`}></div>
      </div>
    </nav>
  );
};

export default Navbar;
