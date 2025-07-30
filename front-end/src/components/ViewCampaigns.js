import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom'; // ✅ Required for navigation
import './css/Campaigns.css';

const ViewCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/campaigns/active', {
        withCredentials: true,
      });
      setCampaigns(res.data);
    } catch {
      Swal.fire('Error', 'Could not load campaigns', 'error');
    }
  };

  const handleContribute = async (c) => {
    const rem = c.target_amount - c.raised_amount;
    const { value } = await Swal.fire({
      title: `Contribute to "${c.title}"`,
      input: 'number',
      inputLabel: `Remaining ₹${rem.toFixed(2)}`,
      inputAttributes: { min: 1, max: rem },
      showCancelButton: true,
      confirmButtonText: 'Contribute'
    });

    if (value) {
      try {
        await axios.post(
          'http://localhost:5000/api/campaigns/contribute',
          {
            campaign_id: c.id,
            amount: value
          },
          { withCredentials: true }
        );
        Swal.fire('Success', 'Thank you!', 'success');
        fetchCampaigns();
      } catch (err) {
        Swal.fire('Error', err.response?.data?.error || 'Failed', 'error');
      }
    }
  };

  return (
    <div className="campaigns-page">
      <h2>🐐 Active Goat Campaigns</h2>
      {campaigns.length === 0 ? (
        <p>No active campaigns.</p>
      ) : (
        <div className="goat-grid">
          {campaigns.map((c) => (
            <div key={c.id} className="goat-card">
              <img src={`http://localhost:5000${c.image_url}`} alt="Goat" />
              <h4>{c.title}</h4>
              <p>{c.description}</p>
              <p><strong>Breed:</strong> {c.breed}</p>
              <p><strong>Target:</strong> ₹{c.target_amount}</p>
              <p><strong>Funded:</strong> ₹{c.raised_amount}</p>
              <p><strong>Progress:</strong> {((c.raised_amount / c.target_amount) * 100).toFixed(1)}%</p>
              <button
                onClick={() => handleContribute(c)}
                disabled={c.raised_amount >= c.target_amount}
              >
                💸 Contribute
              </button>
              <button onClick={() => navigate(`/campaign/${c.id}/contributors`)}>
                👥 View Contributors
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewCampaigns;
