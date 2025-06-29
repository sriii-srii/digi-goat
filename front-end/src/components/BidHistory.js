// ✅ NEW COMPONENT: BidHistory.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './css/bidHistory.css';

const BidHistory = () => {
  const [bids, setBids] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/bids/history', { withCredentials: true })
      .then(res => setBids(res.data))
      .catch(err => console.error('Error fetching bid history:', err));
  }, []);

  return (
    <div className="bid-history-container">
      <h2>📜 My Bid History</h2>
      {bids.length === 0 ? (
        <p>No bids placed yet.</p>
      ) : (
        <div className="bid-list">
          {bids.map(bid => (
            <div className="bid-card" key={bid.bid_id}>
              <img src={`http://localhost:5000${bid.image_url}`} alt="Goat" />
              <div>
                <p><strong>Goat ID:</strong> {bid.goat_id}</p>
                <p><strong>Goat Number:</strong> {bid.goat_number}</p>
                <p><strong>Breed:</strong> {bid.breed}</p>
                <p><strong>Bid Amount:</strong> ₹{bid.bid_amount}</p>
                <p><strong>Placed On:</strong> {new Date(bid.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BidHistory;
