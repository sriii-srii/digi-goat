import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import './css/adminDashboard.css';

const AdminDashboard = () => {
  const [goats, setGoats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const role = Number(localStorage.getItem('role'));
    if (role !== 0) {
      alert('Access denied. Admins only.');
      navigate('/login');
      return;
    }

    axios.get('http://localhost:5000/api/admin/goat-requests', {
      withCredentials: true,
    })
      .then((res) => setGoats(res.data))
      .catch((err) => {
        console.error('❌ Failed to fetch goat requests', err);
        alert('Failed to load goat requests.');
      });
  }, [navigate]);

  const handleAction = async (goatId, action) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/goat-requests/${goatId}`,
        { action },
        { withCredentials: true }
      );
      setGoats((prev) =>
        prev.map((goat) =>
          goat.id === goatId ? { ...goat, status: action } : goat
        )
      );
    } catch (err) {
      console.error(`❌ Failed to ${action} goat`, err);
      alert(`Failed to ${action} goat.`);
    }
  };

  const viewProfile = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/customer/${userId}`, {
        withCredentials: true,
      });

      const user = res.data;
      const imgHTML = user.photo
        ? `<img src="http://localhost:5000${user.photo}" alt="Profile" style="width:100px;height:100px;border-radius:50%;margin-top:10px;border:2px solid #ccc" />`
        : `<div style="width:100px;height:100px;border-radius:50%;background:#eee;display:flex;align-items:center;justify-content:center;">No Photo</div>`;

      Swal.fire({
        title: 'Customer Profile',
        html: `
          <strong>Username:</strong> ${user.username}<br/>
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
      console.error('❌ Failed to fetch profile:', err);
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
        <h2>Sell Requests</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Requested At</th>
                <th>Status</th>
                <th>Actions</th>
                <th>Profile</th>
              </tr>
            </thead>
            <tbody>
              {goats.length === 0 ? (
                <tr>
                  <td colSpan="7">No requests available</td>
                </tr>
              ) : (
                goats.map((goat) => (
                  <tr key={goat.id}>
                    <td>{goat.owner_id}</td>
                    <td>{goat.owner_name}</td>
                    <td>{goat.email}</td>
                    <td>{new Date(goat.created_at).toLocaleString()}</td>
                    <td>
                      <span className={`status ${goat.status}`}>{goat.status}</span>
                    </td>
                    <td>
                      {goat.status === 'pending' ? (
                        <>
                          <button className="btn approve" onClick={() => handleAction(goat.id, 'approved')}>Approve</button>
                          <button className="btn reject" onClick={() => handleAction(goat.id, 'rejected')}>Reject</button>
                        </>
                      ) : (
                        <span className="text-muted">No actions</span>
                      )}
                    </td>
                    <td>
                      <button className="btn profile" onClick={() => viewProfile(goat.owner_id)}>View Profile</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
