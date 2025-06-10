import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import HealthRecordModal from './HealthRecordModal'; // 💊 new
import './css/MyGoats.css';
import './css/goat.css';
import './css/healthRecords.css';

axios.defaults.withCredentials = true;

const MyGoats = () => {
  const navigate = useNavigate();
  const [goats, setGoats] = useState([]);
  const [filteredGoats, setFilteredGoats] = useState([]);
  const [breedFilter, setBreedFilter] = useState('');
  const [minPriceFilter, setMinPriceFilter] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [userId, setUserId] = useState(null);
  const [selectedGoat, setSelectedGoat] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [openHealthModal, setOpenHealthModal] = useState(null); // 💊 state

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingGoatId, setEditingGoatId] = useState(null);

  const [formData, setFormData] = useState({
    goat_number: '',
    breed: '',
    dob: '',
    weight: '',
    health_status: '',
    minimum_price: '',
    maximum_price: '',
    price: '',
  });

  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchGoats();
    axios.get('http://localhost:5000/api/auth/session')
      .then(res => {
        if (res.data?.user) {
          setUserId(res.data.user.id);
        } else {
          Swal.fire('Error', 'User session not found. Please log in.', 'error');
        }
      })
      .catch(() => {
        Swal.fire('Error', 'Session expired. Please log in.', 'error');
      });
  }, []);

  const fetchGoats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/goats/my');
      setGoats(res.data);
      setFilteredGoats(res.data);
    } catch {
      Swal.fire('Error', 'Failed to fetch goats', 'error');
    }
  };

  const applyFilters = () => {
    const filtered = goats.filter(goat => {
      const matchesBreed = breedFilter === '' || goat.breed.toLowerCase().includes(breedFilter.toLowerCase());
      const matchesMin = minPriceFilter === '' || parseFloat(goat.price) >= parseFloat(minPriceFilter);
      const matchesMax = maxPriceFilter === '' || parseFloat(goat.price) <= parseFloat(maxPriceFilter);
      return matchesBreed && matchesMin && matchesMax;
    });
    setFilteredGoats(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [breedFilter, minPriceFilter, maxPriceFilter]);

  const resetFilters = () => {
    setBreedFilter('');
    setMinPriceFilter('');
    setMaxPriceFilter('');
    setFilteredGoats(goats);
  };

  const handleSort = (e) => {
    const sort = e.target.value;
    setSortBy(sort);
    let sorted = [...filteredGoats];
    if (sort === 'price') sorted.sort((a, b) => a.price - b.price);
    if (sort === 'weight') sorted.sort((a, b) => a.weight - b.weight);
    setFilteredGoats(sorted);
  };

  const handleAddFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setImage(null);
      setPreviewUrl(null);
      Swal.fire('Error', 'Please select a valid image file.', 'error');
    }
  };

  const handleEditGoat = (goat) => {
    setFormData({
      goat_number: goat.goat_number,
      breed: goat.breed,
      dob: goat.dob.split('T')[0],
      weight: goat.weight,
      health_status: goat.health_status,
      minimum_price: goat.minimum_price,
      maximum_price: goat.maximum_price,
      price: goat.price || ''
    });
    setPreviewUrl(`http://localhost:5000${goat.image_url}`);
    setShowAddForm(true);
    setIsEditMode(true);
    setEditingGoatId(goat.id);
  };

  const handleUpdateGoat = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '') data.append(key, value);
    });

    if (image) data.append('image', image);

    try {
      await axios.put(`http://localhost:5000/api/goats/${editingGoatId}/update`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      Swal.fire('Updated', 'Goat updated successfully.', 'success');
      fetchGoats();
      setShowAddForm(false);
      setIsEditMode(false);
      setEditingGoatId(null);
      setImage(null);
      setPreviewUrl(null);
      setFormData({ goat_number: '', breed: '', dob: '', weight: '', health_status: '', minimum_price: '', maximum_price: '', price: '' });
    } catch (err) {
      Swal.fire('Error', 'Failed to update goat.', 'error');
    }
  };

  const handleDeleteGoat = async (goatId) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the goat.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/goats/delete/${goatId}`);
        Swal.fire('Deleted!', 'Goat has been deleted.', 'success');
        fetchGoats();
      } catch (err) {
        Swal.fire('Error', 'Failed to delete goat.', 'error');
      }
    }
  };

  const handleAddGoatSubmit = isEditMode ? handleUpdateGoat : async (e) => {
    e.preventDefault();

    if (!userId) {
      Swal.fire('Error', 'User not authenticated.', 'error');
      return;
    }

    const {
      goat_number,
      breed,
      dob,
      weight,
      health_status,
      minimum_price,
      maximum_price,
      price
    } = formData;

    if (!goat_number || !breed || !dob || !weight || !health_status || !minimum_price || !maximum_price || !image) {
      Swal.fire('Error', 'All fields including image are required.', 'error');
      return;
    }

    const today = new Date();
    const enteredDob = new Date(dob);
    if (enteredDob > today) {
      Swal.fire('Error', 'DOB cannot be in the future.', 'error');
      return;
    }

    const parsedWeight = parseFloat(weight);
    const parsedMinPrice = parseFloat(minimum_price);
    const parsedMaxPrice = parseFloat(maximum_price);
    const parsedPrice = price ? parseFloat(price) : null;

    if (parsedWeight <= 0 || parsedMinPrice <= 0 || parsedMaxPrice <= 0) {
      Swal.fire('Error', 'Weight and prices must be positive numbers.', 'error');
      return;
    }

    if (parsedMinPrice > parsedMaxPrice) {
      Swal.fire('Error', 'Min price cannot exceed max price.', 'error');
      return;
    }

    if (parsedPrice !== null && (parsedPrice < parsedMinPrice || parsedPrice > parsedMaxPrice)) {
      Swal.fire('Error', 'Fixed price must be between min and max price.', 'error');
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '') data.append(key, value);
    });
    data.append('image', image);
    data.append('owner_id', userId);

    try {
      await axios.post('http://localhost:5000/api/goats/add', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      Swal.fire('Success', 'Goat added successfully!', 'success');
      setFormData({
        goat_number: '',
        breed: '',
        dob: '',
        weight: '',
        health_status: '',
        minimum_price: '',
        maximum_price: '',
        price: '',
      });
      setImage(null);
      setPreviewUrl(null);
      document.querySelector('input[name="image"]').value = '';
      fetchGoats();
    } catch (err) {
      Swal.fire('Error', 'Failed to add goat.', 'error');
    }
  };

  const openView = (goat) => {
    setSelectedGoat(goat);
    setViewModal(true);
  };

  return (
    <div className="my-goats-container">
      <button onClick={() => navigate('/customer-dashboard')} className="back-btn">⬅ Back</button>

      <h2>My Goats</h2>

      <div className="filter-controls">
        <input type="text" placeholder="Enter breed" value={breedFilter} onChange={(e) => setBreedFilter(e.target.value)} />
        <input type="number" placeholder="Min price" value={minPriceFilter} onChange={(e) => setMinPriceFilter(e.target.value)} />
        <input type="number" placeholder="Max price" value={maxPriceFilter} onChange={(e) => setMaxPriceFilter(e.target.value)} />
        <button onClick={resetFilters} className="reset-btn">Reset Filters</button>
        <select onChange={handleSort} value={sortBy}>
          <option value="">Sort by</option>
          <option value="price">Price</option>
          <option value="weight">Weight</option>
        </select>
        <button onClick={() => {
          setShowAddForm(!showAddForm);
          setIsEditMode(false);
          setFormData({
            goat_number: '',
            breed: '',
            dob: '',
            weight: '',
            health_status: '',
            minimum_price: '',
            maximum_price: '',
            price: '',
          });
          setPreviewUrl(null);
        }} className="toggle-add-btn">
          {showAddForm ? 'Cancel' : '+ Add Goat'}
        </button>
      </div>

      {showAddForm && (
        <div className="goat-form-container">
          <h3>{isEditMode ? 'Edit Goat' : 'Register Goat'}</h3>
          <form onSubmit={handleAddGoatSubmit} encType="multipart/form-data">
            <input type="text" name="goat_number" placeholder="Goat Number" value={formData.goat_number} onChange={handleAddFormChange} required />
            <input type="text" name="breed" placeholder="Breed" value={formData.breed} onChange={handleAddFormChange} required />
            <input type="date" name="dob" value={formData.dob} onChange={handleAddFormChange} required />
            <input type="number" step="0.01" name="weight" placeholder="Weight (kg)" value={formData.weight} onChange={handleAddFormChange} required />
            <input type="text" name="health_status" placeholder="Health Status" value={formData.health_status} onChange={handleAddFormChange} required />
            <input type="number" step="0.01" name="minimum_price" placeholder="Minimum Price" value={formData.minimum_price} onChange={handleAddFormChange} required />
            <input type="number" step="0.01" name="maximum_price" placeholder="Maximum Price" value={formData.maximum_price} onChange={handleAddFormChange} required />
            <input type="number" step="0.01" name="price" placeholder="Fixed Price (optional)" value={formData.price} onChange={handleAddFormChange} />
            <input type="file" name="image" accept="image/*" onChange={handleAddImageChange} />
            {previewUrl && <img src={previewUrl} alt="Preview" style={{ maxHeight: '200px' }} />}
            <button type="submit">{isEditMode ? 'Update Goat' : 'Add Goat'}</button>
          </form>
        </div>
      )}

      <div className="goat-grid">
        {filteredGoats.length === 0 ? (
          <p>No goats found.</p>
        ) : (
          filteredGoats.map((goat) => (
            <div className="goat-card" key={goat.id}>
              <div className="goat-header">
                Goat #{goat.goat_number} - {goat.breed}
              </div>
              <div className="goat-info">
                <p><strong>DOB:</strong> {new Date(goat.dob).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {goat.is_active ? 'Active' : 'Inactive'}</p>
              </div>
              <div className="goat-actions">
                <button onClick={() => openView(goat)}>View Details</button>
                <button onClick={() => handleEditGoat(goat)} className="edit-btn">Edit Listing</button>
                <button onClick={() => handleDeleteGoat(goat.id)} className="delete-btn">Delete</button>
                <button onClick={() => setOpenHealthModal(goat.id)}>Health Records</button>
              </div>
            </div>
          ))
        )}
      </div>

      {viewModal && selectedGoat && (
        <div className="modal-overlay" onClick={() => setViewModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Goat Details</h3>
            <img src={`http://localhost:5000${selectedGoat.image_url}`} alt="Goat" style={{ width: '100%', borderRadius: '10px' }} />
            <p><strong>Number:</strong> {selectedGoat.goat_number}</p>
            <p><strong>Breed:</strong> {selectedGoat.breed}</p>
            <p><strong>DOB:</strong> {new Date(selectedGoat.dob).toLocaleDateString()}</p>
            <p><strong>Weight:</strong> {selectedGoat.weight} kg</p>
            <p><strong>Health:</strong> {selectedGoat.health_status}</p>
            <p><strong>Min Price:</strong> ₹{selectedGoat.minimum_price}</p>
            <p><strong>Max Price:</strong> ₹{selectedGoat.maximum_price}</p>
            <p><strong>Fixed Price:</strong> ₹{selectedGoat.price}</p>
            <button onClick={() => setViewModal(false)}>Close</button>
          </div>
        </div>
      )}

      {openHealthModal && (
        <HealthRecordModal goatId={openHealthModal} onClose={() => setOpenHealthModal(null)} />
      )}
    </div>
  );
};

export default MyGoats;
