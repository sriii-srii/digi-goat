import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const PurchasedGoats = () => {
  const [purchases, setPurchases] = useState([]);
  const [review, setReview] = useState({});
  const [rating, setRating] = useState({});

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    const res = await axios.get('http://localhost:5000/api/purchases/my', { withCredentials: true });
    setPurchases(res.data);
  };

  const handleSubmit = async (purchaseId) => {
    try {
      await axios.post('http://localhost:5000/api/purchases/review', {
        purchase_id: purchaseId,
        rating: rating[purchaseId],
        review: review[purchaseId],
      }, { withCredentials: true });

      Swal.fire('Success', 'Review submitted successfully!', 'success');
      fetchPurchases();
    } catch {
      Swal.fire('Error', 'Failed to submit review', 'error');
    }
  };

  return (
    <div className="my-goats-container">
      <h2>My Purchased Goats</h2>
      <div className="goat-grid">
        {purchases.map(p => (
          <div className="goat-card" key={p.id}>
            <h4>#{p.goat_number} - {p.breed}</h4>
            <img src={`http://localhost:5000${p.image_url}`} alt="Goat" />
            <p>Weight: {p.weight} kg</p>
            <p><strong>Purchased:</strong> {new Date(p.purchase_date).toLocaleDateString()}</p>

            <select value={rating[p.id] || p.rating || ''} onChange={(e) => setRating({ ...rating, [p.id]: e.target.value })}>
              <option value="">Select Rating</option>
              <option value="1">⭐ 1</option>
              <option value="2">⭐ 2</option>
              <option value="3">⭐ 3</option>
              <option value="4">⭐ 4</option>
              <option value="5">⭐ 5</option>
            </select>

            <textarea
              placeholder="Write your review"
              value={review[p.id] || p.review || ''}
              onChange={(e) => setReview({ ...review, [p.id]: e.target.value })}
            />

            <button onClick={() => handleSubmit(p.id)}>Submit Review</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PurchasedGoats;
