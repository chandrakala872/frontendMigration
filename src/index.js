import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Auth0Provider } from '@auth0/auth0-react';

const domain = "dev-qyezg6s35kzzqg7v.us.auth0.com";
const clientId = "T2AVlpDm3nHs6zgWzjgyBxV8kDQc64OK";  // replace with your actual client ID
const redirectUri = "http://localhost:3000"; ;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Auth0Provider
  domain="dev-qyezg6s35kzzqg7v.us.auth0.com"
  clientId="T2AVlpDm3nHs6zgWzjgyBxV8kDQc64OK"
  authorizationParams={{
    redirect_uri: window.location.origin,
    audience: "https://migration-uri.com"  // 👈 THIS IS IMPORTANT
  }}
>
  <App />
</Auth0Provider>

);
// new one
