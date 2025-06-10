import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './css/goat.css';

const BuyGoats = () => {
  const [goats, setGoats] = useState([]);
  const [userId, setUserId] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    // Fetch current session user
    axios.get('http://localhost:5000/api/auth/session', { withCredentials: true })
      .then(res => setUserId(res.data.user?.id))
      .catch(() => Swal.fire('Error', 'Failed to get session info', 'error'));

    fetchGoats();
    fetchWishlist();
  }, []);

  const fetchGoats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/goats/market', { withCredentials: true });
      setGoats(res.data);
    } catch {
      Swal.fire('Error', 'Failed to load goats', 'error');
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/wishlist/my', { withCredentials: true });
      setWishlist(res.data.map(item => item.id));
    } catch {
      Swal.fire('Error', 'Failed to load wishlist', 'error');
    }
  };

  const toggleWishlist = async (goatId) => {
    const isWished = wishlist.includes(goatId);
    try {
      if (isWished) {
        await axios.delete(`http://localhost:5000/api/wishlist/remove/${goatId}`, { withCredentials: true });
        Swal.fire('Removed', 'Goat removed from wishlist', 'success');
      } else {
        await axios.post(`http://localhost:5000/api/wishlist/add`, { goat_id: goatId }, { withCredentials: true });
        Swal.fire('Added', 'Goat added to wishlist', 'success');
      }
      fetchWishlist();
    } catch {
      Swal.fire('Error', 'Something went wrong', 'error');
    }
  };

  const purchaseGoat = async (goatId) => {
    try {
      const res = await axios.post('http://localhost:5000/api/purchases/buy', { goat_id: goatId }, { withCredentials: true });
      Swal.fire({
        icon: 'success',
        title: 'Goat Purchased',
        text: 'You have successfully purchased the goat!',
        confirmButtonColor: '#3085d6'
      });
      fetchGoats();  // Optionally refresh list
    } catch {
      Swal.fire('Error', 'Failed to purchase goat', 'error');
    }
  };

  return (
    <div className="my-goats-container">
      <h2>Available Goats</h2>
      <div className="goat-grid">
        {goats.filter(g => g.owner_id !== userId).map(goat => (
          <div className="goat-card" key={goat.id}>
            <h4>#{goat.goat_number} - {goat.breed}</h4>
            <img src={`http://localhost:5000${goat.image_url}`} alt="Goat" />
            <p>Weight: {goat.weight} kg</p>
            <p>Price: ₹{goat.minimum_price} - ₹{goat.maximum_price}</p>

            <button
              onClick={() => toggleWishlist(goat.id)}
              style={{
                backgroundColor: wishlist.includes(goat.id) ? 'red' : 'purple',
                color: 'white',
                marginBottom: '5px'
              }}
            >
              {wishlist.includes(goat.id) ? '❤️ Remove from Wishlist' : '💜 Add to Wishlist'}
            </button>

            <button
              onClick={() => purchaseGoat(goat.id)}
              style={{
                backgroundColor: 'green',
                color: 'white',
                marginTop: '5px'
              }}
            >
              ✅ Purchase
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyGoats;
