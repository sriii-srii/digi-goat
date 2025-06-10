// components/dash_board.js
import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import './dash_board.css';
import axios from 'axios';

const CustomerDashboard = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    axios.get('/api/customers/profile', { withCredentials: true })
      .then(res => setProfile(res.data))
      .catch(err => {
        console.error('Failed to fetch profile:', err);
        setProfile(null);
      });
  }, []);

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <h1>Customer Dashboard</h1>
        <p>Welcome, {profile.username}!</p>

        <div className="profile-section">
          <h2>Profile Overview</h2>
          <p><strong>Name:</strong> {profile.username}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Address:</strong> {profile.address}</p>
          <p><strong>Can Buy:</strong> {profile.can_buy ? 'Yes' : 'No'}</p>
          <p><strong>Can Sell:</strong> {profile.can_sell ? 'Approved' : 'Not Approved'}</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
