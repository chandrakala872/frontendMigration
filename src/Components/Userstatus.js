// src/components/UserStatus.js

import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const UserStatus = () => {
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchToken = async () => {
      if (isAuthenticated) {
        const token = await getAccessTokenSilently();
        console.log("Access Token:", token); // This is the token sent to backend
      }
    };

    fetchToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  return (
    <div>
      {isAuthenticated ? (
        <p>Logged in as {user.name}</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
};

export default UserStatus;
