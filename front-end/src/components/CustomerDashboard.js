import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './css/customerDashboard.css';

function CustomerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    username: '',
    name: '',
    email: '',
    phone_number: '',
    address: '',
    photo: '',
    can_buy: false,
    can_sell: false
  });

  useEffect(() => {
    const role = Number(localStorage.getItem('role'));
    if (role !== 1) {
      alert('Access denied. Only customers allowed.');
      navigate('/login');
      return;
    }

    async function fetchUserData() {
      try {
        const res = await fetch('http://localhost:5000/api/customers/profile', {
          method: 'GET',
          credentials: 'include'
        });

        if (res.status === 401) {
          alert('Session expired. Please log in again.');
          navigate('/login');
          return;
        }

        const data = await res.json();

        console.log('🔍 Fetched profile:', data);

        setProfile({
          username: data.username, // <- alias for u.name
          name: data.name,
          email: data.email,
          phone_number: data.phone_number,
          address: data.address || '',
          photo: data.photo ? `http://localhost:5000${data.photo}` : '',
          can_buy: data.can_buy === 1,
          can_sell: data.can_sell === 1
        });

      } catch (err) {
        console.error('❌ Error fetching user data:', err);
        alert('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [navigate]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="customer-dashboard">
      <Sidebar />
      <div className="main">
        <header>
          <h1>Customer Dashboard</h1>
          {profile.photo ? (
            <img
              src={profile.photo}
              alt="Profile"
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'cover',
                borderRadius: '50%',
                marginBottom: '10px',
                border: '2px solid #ddd'
              }}
            />
          ) : (
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: '#eee',
                border: '2px solid #ddd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: '#777'
              }}
            >
              No Photo
            </div>
          )}
        </header>

        <div className="welcome-message">
          Welcome, {profile.name || profile.username}!
        </div>

        <div className="profile-card">
          <h2>Profile Overview</h2>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone:</strong> {profile.phone_number}</p>
          <p><strong>Address:</strong> {profile.address}</p>
          <p><strong>Can Buy:</strong> {profile.can_buy ? 'Yes' : 'No'}</p>
          <p><strong>Can Sell:</strong> {profile.can_sell ? 'Approved' : 'No'}</p>
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboard;
