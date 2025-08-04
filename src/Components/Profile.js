// import React from "react";
// import { useAuth0 } from "@auth0/auth0-react";
// import { useNavigate } from "react-router-dom";
// import "./Profile.css";

// const Profile = () => {
//   const { user, isAuthenticated, isLoading } = useAuth0();
//   const navigate = useNavigate();

//   if (isLoading) {
//     return (
//       <div className="profile-loading">
//         <div className="loading-spinner"></div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     navigate("/");
//     return null;
//   }

//   return (
//     <div className="profile-container">
//       <div className="profile-card">
//         <div className="profile-header">
//           <h2>Account Information</h2>
//         </div>
        
//         <div className="profile-details">
//           <div className="detail-row">
//             <span className="detail-label">Username:</span>
//             <span className="detail-value">{user.name || "Not provided"}</span>
//           </div>
          
//           <div className="detail-row">
//             <span className="detail-label">Email:</span>
//             <span className="detail-value">{user.email}</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;

// Profile.js
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) return <div>Please log in to see your profile.</div>;

  return (
    <div>
      <img src={user.picture} alt={user.name} width={50} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
};

export default Profile;
