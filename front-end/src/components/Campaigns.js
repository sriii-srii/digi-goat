import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Modal from 'react-modal';
import './css/Campaigns.css';

Modal.setAppElement('#root');

const Campaigns = () => {
  const [goats, setGoats] = useState([]);
  const [selectedGoat, setSelectedGoat] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_amount: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchMyGoats();
  }, []);

  const fetchMyGoats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/goats/my', { withCredentials: true });
      setGoats(res.data);
    } catch (err) {
      console.error('🐐 Failed to fetch goats', err);
    }
  };

  const handleFormChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitCampaign = async () => {
    if (!selectedGoat) return;

    try {
      const payload = {
        goat_id: selectedGoat.id,
        ...formData,
        status: 'active' // ✅ Added this line to fill the status column
      };

      await axios.post('http://localhost:5000/api/campaigns/add', payload, {
        withCredentials: true
      });

      Swal.fire('Success', 'Campaign created!', 'success');
      setSelectedGoat(null);
      setFormData({
        title: '',
        description: '',
        target_amount: '',
        start_date: '',
        end_date: ''
      });
    } catch (err) {
      Swal.fire('Error', 'Failed to create campaign', 'error');
      console.error(err);
    }
  };

  return (
    <div className="campaigns-page">
      <h2>📢 Start Campaigns for Your Goats</h2>

      <div className="goat-grid">
        {goats.map(goat => (
          <div key={goat.id} className="goat-card">
            <img src={`http://localhost:5000${goat.image_url}`} alt="Goat" />
            <p><strong>ID:</strong> {goat.goat_number}</p>
            <p><strong>Breed:</strong> {goat.breed}</p>
            <button onClick={() => setSelectedGoat(goat)}>Start Campaign</button>
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!selectedGoat}
        onRequestClose={() => setSelectedGoat(null)}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <h3>📄 Campaign Form for Goat #{selectedGoat?.goat_number}</h3>
        <form onSubmit={e => { e.preventDefault(); submitCampaign(); }}>
          <input type="text" name="title" placeholder="Campaign Title" value={formData.title} onChange={handleFormChange} required />
          <textarea name="description" placeholder="Description" value={formData.description} onChange={handleFormChange} />
          <input type="number" name="target_amount" placeholder="Target Amount" value={formData.target_amount} onChange={handleFormChange} required />
          <input type="date" name="start_date" value={formData.start_date} onChange={handleFormChange} required />
          <input type="date" name="end_date" value={formData.end_date} onChange={handleFormChange} required />
          <div className="form-buttons">
            <button type="submit">Submit</button>
            <button type="button" onClick={() => setSelectedGoat(null)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Campaigns;
