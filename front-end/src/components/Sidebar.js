import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './css/Sidebar.css'; 

const Sidebar = () => {
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/customers/profile', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        setCustomer(data);
      } catch (err) {
        console.error('Failed to load customer:', err);
      }
    };

    fetchCustomer();
  }, []);

  return (
    <div className="sidebar">
      {customer && (
        <div className="sidebar-profile">
          <img
            src={`http://localhost:5000/uploads/${customer.photo}`}
            alt="Profile"
            className="sidebar-profile-pic"
          />
          <h3>{customer.name || 'Customer'}</h3>
          <p>{customer.address || 'No address provided'}</p>
        </div>
      )}

      <ul className="sidebar-menu">
        <li><Link to="/customer-dashboard">Dashboard</Link></li>
        <li><Link to="/customer-profile">👤 Profile</Link></li>
        <li><Link to="/buy-goats">🐐 Buy Goats</Link></li>
        <li><Link to="/wishlist">💖 Wishlist</Link></li>
        <li><Link to="/orders"> 🛒 Orders</Link></li>
        <li><Link to="/purchased-goats">📦 Purchased Goats</Link></li>
        {/*} <li><Link to="/add-goat">Goat Registration</Link></li>*/}
        <li><Link to="/my-goats">🐐 My Goats</Link></li>
        <li><Link to="/logout">Logout</Link></li>
        {/*} <li><Link to="/add-goat">Goat Registration</Link></li>*/}
      </ul>
    </div>
  );
};

export default Sidebar;
