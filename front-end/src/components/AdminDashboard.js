import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import './css/adminDashboard.css';

const AdminDashboard = () => {
  const [goats, setGoats] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const role = Number(localStorage.getItem('role'));
    if (role !== 0) {
      alert('Access denied. Admins only.');
      navigate('/login');
      return;
    }

    fetchGoatRequests();
    fetchCampaigns();
  }, [navigate]);

  const fetchGoatRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/goat-requests', { withCredentials: true });
      setGoats(res.data);
    } catch (err) {
      alert('Failed to load goat requests.');
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/campaigns', { withCredentials: true });
      setCampaigns(res.data);
    } catch (err) {
      alert('Failed to load campaigns.');
    }
  };

  const handleGoatAction = async (goatId, action) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/goat-requests/${goatId}`, { action }, { withCredentials: true });
      setGoats(prev => prev.map(g => g.id === goatId ? { ...g, status: action } : g));
    } catch (err) {
      alert(`Failed to ${action} goat.`);
    }
  };

  const handleStatusChange = async (campaignId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/campaigns/${campaignId}/status`, { status: newStatus }, { withCredentials: true });
      setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: newStatus } : c));
    } catch (err) {
      alert('Failed to update campaign status.');
    }
  };

  const viewProfile = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/customer/${userId}`, { withCredentials: true });
      const user = res.data;
      const imgHTML = user.photo
        ? `<img src="http://localhost:5000${user.photo}" alt="Profile" style="width:100px;height:100px;border-radius:50%;margin-top:10px;" />`
        : `<div style="width:100px;height:100px;border-radius:50%;background:#eee;">No Photo</div>`;

      Swal.fire({
        title: 'Customer Profile',
        html: `
          <strong>Name:</strong> ${user.username}<br/>
          <strong>Email:</strong> ${user.email}<br/>
          <strong>Address:</strong> ${user.address}<br/>
          <strong>Can Buy:</strong> ${user.can_buy ? 'Yes' : 'No'}<br/>
          <strong>Can Sell:</strong> ${user.can_sell ? 'Yes' : 'No'}<br/>
          <strong>Verified:</strong> ${user.verified ? 'Yes' : 'No'}<br/>
          ${imgHTML}
        `,
        icon: 'info',
        confirmButtonText: 'OK'
      });

    } catch (err) {
      alert('Failed to load customer profile.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <h2>Digi Goat Admin</h2>
        <ul>
          <li className="active">📋 Dashboard</li>
          <li onClick={handleLogout}>↩️ Logout</li>
        </ul>
      </aside>

      <main className="admin-main">
        <h1>Admin Dashboard</h1>

        {/* 🐐 Goat Section */}
        <section>
          <h2>Sell Requests</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Requested At</th>
                  <th>Status</th>
                  <th>Actions</th>
                  <th>Profile</th>
                </tr>
              </thead>
              <tbody>
                {goats.length === 0 ? (
                  <tr><td colSpan="7">No requests available</td></tr>
                ) : goats.map(goat => (
                  <tr key={goat.id}>
                    <td>{goat.owner_id}</td>
                    <td>{goat.owner_name}</td>
                    <td>{goat.email}</td>
                    <td>{new Date(goat.created_at).toLocaleString()}</td>
                    <td><span className={`status ${goat.status}`}>{goat.status}</span></td>
                    <td>
                      {goat.status === 'pending' ? (
                        <>
                          <button onClick={() => handleGoatAction(goat.id, 'approved')}>Approve</button>
                          <button onClick={() => handleGoatAction(goat.id, 'rejected')}>Reject</button>
                        </>
                      ) : (
                        <span>No Actions</span>
                      )}
                    </td>
                    <td>
                      <button onClick={() => viewProfile(goat.owner_id)}>View Profile</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 📢 Campaign Section */}
        <section style={{ marginTop: '50px' }}>
          <h2>Campaign Moderation</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Goat</th>
                  <th>Creator</th>
                  <th>Status</th>
                  <th>Change Status</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 ? (
                  <tr><td colSpan="6">No campaigns found</td></tr>
                ) : campaigns.map(c => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.title}</td>
                    <td>
                      <img src={`http://localhost:5000${c.image_url}`} alt="Goat" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                      <br />{c.breed}
                    </td>
                    <td>{c.creator_name}</td>
                    <td>{c.status}</td>
                    <td>
                      <select value={c.status} onChange={(e) => handleStatusChange(c.id, e.target.value)}>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
