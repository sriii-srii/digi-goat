import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = async () => {
    const res = await axios.get('http://localhost:5000/api/wishlist/my');
    setWishlist(res.data);
  };

  const removeFromWishlist = async (goatId) => {
    try {
      await axios.delete(`http://localhost:5000/api/wishlist/remove/${goatId}`);
      Swal.fire('Removed', 'Goat removed successfully', 'success');
      fetchWishlist();
    } catch {
      Swal.fire('Error', 'Failed to remove', 'error');
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <div className="my-goats-container">
      <h2>My Wishlist</h2>
      {wishlist.length === 0 ? (
        <p>No goats in wishlist.</p>
      ) : (
        <div className="goat-grid">
          {wishlist.map(goat => (
            <div className="goat-card" key={goat.id}>
              <h3>{goat.goat_number} - {goat.breed}</h3>
              <img src={`http://localhost:5000${goat.image_url}`} alt="Goat" />
              <p>Weight: {goat.weight} kg</p>
              <p>Price: ₹{goat.minimum_price} - ₹{goat.maximum_price}</p>
              <button onClick={() => removeFromWishlist(goat.id)} style={{ backgroundColor: 'red' }}>
                🗑️ Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
