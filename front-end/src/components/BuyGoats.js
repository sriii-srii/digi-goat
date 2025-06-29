// src/components/BuyGoats.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Dropzone from 'react-dropzone';
import ImageGallery from 'react-image-gallery';
import ReactPlayer from 'react-player';
import 'react-image-gallery/styles/css/image-gallery.css';
import './css/goat.css';
import './css/healthRecords.css';
import './css/mediaGallery.css';

axios.defaults.withCredentials = true;

const BuyGoats = () => {
  const [goats, setGoats] = useState([]);
  const [filteredGoats, setFilteredGoats] = useState([]);
  const [userId, setUserId] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [healthStatuses, setHealthStatuses] = useState({});
  const [mediaData, setMediaData] = useState({});
  const [healthFilter, setHealthFilter] = useState('All');

  useEffect(() => {
    axios.get('/api/auth/session')
      .then(res => setUserId(res.data.user?.id))
      .catch(() => Swal.fire('Error', 'Failed to get session info', 'error'));

    loadData();
  }, []);

  const loadData = () => {
    fetchGoats();
    fetchWishlist();
  };

  const fetchGoats = async () => {
    try {
      const { data } = await axios.get('/api/goats/market');
      setGoats(data);
      data.forEach(g => {
        fetchHealthStatus(g.id);
        fetchMedia(g.id);
      });
    } catch {
      Swal.fire('Error', 'Failed to load goats', 'error');
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await axios.get('/api/wishlist/my');
      setWishlist(res.data.map(item => item.id));
    } catch {
      Swal.fire('Error', 'Failed to load wishlist', 'error');
    }
  };

  const fetchHealthStatus = async (goatId) => {
    try {
      const res = await axios.get(`/api/health/latest/${goatId}`);
      setHealthStatuses(prev => ({ ...prev, [goatId]: res.data }));
    } catch {
      console.error('Health fetch error', goatId);
    }
  };

  const fetchMedia = async (goatId) => {
    try {
      const res = await axios.get(`/api/media/${goatId}`);
      setMediaData(prev => ({ ...prev, [goatId]: res.data }));
    } catch {
      console.error('Media fetch failed', goatId);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [goats, healthFilter, healthStatuses]);

  const applyFilters = () => {
    let arr = [...goats];
    if (healthFilter !== 'All') {
      arr = arr.filter(g => {
        const s = healthStatuses[g.id]?.status;
        if (healthFilter === 'Healthy') return s === 'Healthy';
        if (healthFilter === 'Needs Attention') return ['Needs Attention', 'Critical'].includes(s);
        if (healthFilter === 'Not Vaccinated') return s === 'No Records';
        return true;
      });
    }
    setFilteredGoats(arr);
  };

  const toggleWishlist = async (id) => {
    try {
      if (wishlist.includes(id)) {
        await axios.delete(`/api/wishlist/remove/${id}`);
        Swal.fire('Removed', 'Goat removed from wishlist', 'success');
      } else {
        await axios.post('/api/wishlist/add', { goat_id: id });
        Swal.fire('Added', 'Goat added to wishlist', 'success');
      }
      fetchWishlist();
    } catch {
      Swal.fire('Error', 'Something went wrong', 'error');
    }
  };

  const handlePlaceBid = async (goat) => {
    const { id, minimum_price, maximum_price, price } = goat;
    const result = await Swal.fire({
      title: 'Place Your Bid',
      html: `
        <p><strong>Min:</strong> ₹${minimum_price}</p>
        <p><strong>Max:</strong> ₹${maximum_price}</p>
        <p><strong>Fixed:</strong> ₹${price || 'Not fixed'}</p>
        <input type="number" id="bid" class="swal2-input" placeholder="Enter bid" min="${minimum_price}" max="${maximum_price}">
      `,
      preConfirm: () => {
        const val = document.getElementById('bid').value;
        if (!val || val < minimum_price || val > maximum_price) {
          Swal.showValidationMessage(`Bid must be between ₹${minimum_price} and ₹${maximum_price}`);
        }
        return val;
      },
      showCancelButton: true,
      confirmButtonText: 'Submit Bid'
    });

    if (result.value) {
      try {
        const res = await axios.post('/api/bids/place', { goat_id: id, bid_amount: result.value });
        Swal.fire(res.data?.sold ? '🎉 Goat Sold!' : 'Success', 'Your bid has been placed!', 'success');
        loadData();
      } catch (error) {
        Swal.fire('Error', error.response?.data?.error || 'Bid failed', 'error');
      }
    }
  };

  const renderMediaGallery = (id) => {
    const items = mediaData[id] || [];
    if (items.length === 0) return null;

    const galleryItems = items
      .filter(m => m.media_type === 'image' || m.media_type === 'video')
      .map(m => {
        if (m.media_type === 'image') {
          return { original: `http://localhost:5000${m.media_url}` };
        } else {
          return {
            original: `http://localhost:5000${m.media_url}`,
            embedUrl: `http://localhost:5000${m.media_url}`,
            renderItem: () => <ReactPlayer url={`http://localhost:5000${m.media_url}`} controls width="100%" />
          };
        }
      });
    return <ImageGallery items={galleryItems} showPlayButton={false} />;
  };

  const statusEmoji = (status) =>
    status === 'Healthy' ? '✅' :
    ['Needs Attention', 'Critical'].includes(status) ? '⚠️' :
    status === 'No Records' ? '❌' : '';

  return (
    <div className="my-goats-container">
      <h2>Available Goats</h2>

      <div className="filter-health">
        <label>Filter by Health:</label>
        <select value={healthFilter} onChange={e => setHealthFilter(e.target.value)}>
          <option>All</option>
          <option>Healthy</option>
          <option>Needs Attention</option>
          <option>Not Vaccinated</option>
        </select>
      </div>

      <div className="goat-grid">
        {filteredGoats.filter(g => g.owner_id !== userId).map(goat => {
          const h = healthStatuses[goat.id];
          const st = h?.status;
          return (
            <div className="goat-card" key={goat.id}>
              <h4>#{goat.goat_number} - {goat.breed}</h4>

              <div className="media-gallery-wrapper">
                {renderMediaGallery(goat.id) ||
                  <img src={`http://localhost:5000${goat.image_url}`} alt="Goat" />
                }
              </div>

              <p>Weight: {goat.weight} kg</p>
              <p>Price: ₹{goat.minimum_price}–₹{goat.maximum_price}</p>
              <p>Status: {goat.is_sold ? '🛑 Sold' : '🟢 Available'}</p>

              {st && (
                <div className="health-summary">
                  <p><strong>{statusEmoji(st)} {st === 'No Records' ? 'Not Vaccinated' : st}</strong></p>
                  {st === 'Healthy' && <span className="badge healthy">Recently Vaccinated</span>}
                  {['Needs Attention', 'Critical'].includes(st) && <span className="badge alert">Needs Medical Attention</span>}
                </div>
              )}

              <button
                className="wishlist-btn"
                onClick={() => toggleWishlist(goat.id)}>
                {wishlist.includes(goat.id) ? '❤️ Remove from Wishlist' : '💜 Add to Wishlist'}
              </button>

              <button
                className="bid-btn"
                onClick={() => handlePlaceBid(goat)}
                disabled={goat.is_sold}>
                {goat.is_sold ? 'Bidding Closed' : '🟢 Place a Bid'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BuyGoats;
