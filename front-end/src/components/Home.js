// src/components/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './css/login.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-card">
        <h1 className="home-title">Welcome to Digi Goat</h1>
        <p className="home-subtitle">Please choose an option to continue</p>
        <div className="home-buttons">
          <button className="home-btn login-btn" onClick={() => navigate('/login')}>
            Log In
          </button>
          <button className="home-btn register-btn" onClick={() => navigate('/register')}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
