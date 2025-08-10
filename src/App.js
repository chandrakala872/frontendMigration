import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Dashboard from './Components/Dashboard';
import Migration from './Components/Migration'; // Using your Migration component
import Settings from './Components/Settings';
import Profile from './Components/Profile';
import Login from './Components/Login';
import Logout from './Components/Logout';
 import Collection from './Components/Collection'
 import Function from './Components/Function';
 import Analysispage from './Components/Analysispage'
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="app-container">
        {/* Navbar will appear on all pages */}
        <Navbar />
        
        {/* Main content area */}
        <div className="main-content">
          <Routes>
            {/* Dashboard */}
            {/* <Route path="/" element={<Dashboard />} /> */}
            
            {/* Migration Wizard - renders your Migration component */}
            <Route path="/migration-wizard" element={<Migration />} />
             {/* <Route path="/collection" element={<Collection />} /> */}
             <Route path="/functions" element={<Function />} />
        <Route path="/collections" element={<Collection />} />
         <Route path="/analysis" element={<Analysispage />} />
            
            {/* Settings */}
            <Route path="/settings" element={<Settings />} />
            
            {/* User Profile */}
            <Route path="/profile" element={<Profile />} />
            
            {/* Authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;