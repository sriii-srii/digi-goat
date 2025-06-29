import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useDropzone } from 'react-dropzone';
import HealthRecordModal from './HealthRecordModal';
import './css/MyGoats.css';
import './css/goat.css';
import './css/healthRecords.css';
import './css/mediaGallery.css';

axios.defaults.withCredentials = true;
const MAX_MEDIA = 6;

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
  const [openHealthModal, setOpenHealthModal] = useState(null);
  const [healthStatuses, setHealthStatuses] = useState({});
  const [mediaPreview, setMediaPreview] = useState(null);
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
    image: null
  });

  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState([]);

  useEffect(() => {
    fetchGoats();
    axios.get('http://localhost:5000/api/auth/session')
      .then(res => res.data?.user && setUserId(res.data.user.id))
      .catch(() => Swal.fire('Error', 'Session expired. Please log in.', 'error'));
  }, []);

  const fetchGoats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/goats/my');
      setGoats(res.data);
      setFilteredGoats(res.data);
      res.data.forEach(goat => fetchHealthStatus(goat.id));
    } catch {
      Swal.fire('Error', 'Failed to fetch goats', 'error');
    }
  };

  const fetchHealthStatus = async (goatId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/health/latest/${goatId}`);
      setHealthStatuses(prev => ({ ...prev, [goatId]: res.data }));
    } catch (err) {
      console.error('⚠️ Health fetch error:', err);
    }
  };

  useEffect(() => applyFilters(), [breedFilter, minPriceFilter, maxPriceFilter, goats]);

  const applyFilters = () => {
    const filtered = goats.filter(goat => {
      const matchesBreed = breedFilter === '' || goat.breed.toLowerCase().includes(breedFilter.toLowerCase());
      const matchesMin = minPriceFilter === '' || parseFloat(goat.price) >= parseFloat(minPriceFilter);
      const matchesMax = maxPriceFilter === '' || parseFloat(goat.price) <= parseFloat(maxPriceFilter);
      return matchesBreed && matchesMin && matchesMax;
    });
    setFilteredGoats(filtered);
  };

  const resetFilters = () => {
    setBreedFilter('');
    setMinPriceFilter('');
    setMaxPriceFilter('');
    setFilteredGoats(goats);
  };

  const handleSort = (e) => {
    const sort = e.target.value;
    setSortBy(sort);
    const sorted = [...filteredGoats];
    if (sort === 'price') sorted.sort((a, b) => a.price - b.price);
    if (sort === 'weight') sorted.sort((a, b) => a.weight - b.weight);
    setFilteredGoats(sorted);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setFormData({ ...formData, image: file });
      setMediaPreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, image: null });
      setMediaPreview(null);
      Swal.fire('Error', 'Please select a valid image file.', 'error');
    }
  };

  const onDrop = useCallback(acceptedFiles => {
    const combined = [...mediaFiles, ...acceptedFiles].slice(0, MAX_MEDIA);
    setMediaFiles(combined);
    setMediaPreviewUrls(
      combined.map(file => ({
        type: file.type.startsWith('video') ? 'video' : 'image',
        url: URL.createObjectURL(file),
      }))
    );
  }, [mediaFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/jpeg, image/png, video/mp4, video/webm',
    maxSize: 10 * 1024 * 1024,
  });

  const removeMedia = idx => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== idx));
    setMediaPreviewUrls(mediaPreviewUrls.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (k === 'image' && v) data.append('image', v);
      else if (k !== 'image') data.append(k, v);
    });
    data.append('owner_id', userId);
    mediaFiles.forEach(file => data.append('media', file));

    try {
      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/goats/${editingGoatId}/update`, data);
        Swal.fire('Updated', 'Goat updated successfully.', 'success');
      } else {
        await axios.post('http://localhost:5000/api/goats/add', data);
        Swal.fire('Added', 'Goat added successfully.', 'success');
      }
      resetForm();
      fetchGoats();
    } catch {
      Swal.fire('Error', 'Failed to save goat.', 'error');
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
      price: goat.price || '',
      image: null
    });
    setMediaPreview(`http://localhost:5000${goat.image_url}`);
    setIsEditMode(true);
    setEditingGoatId(goat.id);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      goat_number: '',
      breed: '',
      dob: '',
      weight: '',
      health_status: '',
      minimum_price: '',
      maximum_price: '',
      price: '',
      image: null
    });
    setMediaPreview(null);
    setMediaFiles([]);
    setMediaPreviewUrls([]);
    setIsEditMode(false);
    setEditingGoatId(null);
    setShowAddForm(false);
  };

  const handleDeleteGoat = async (goatId) => {
    const confirm = await Swal.fire({ title: 'Delete Goat?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes' });
    if (confirm.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/goats/delete/${goatId}`);
        Swal.fire('Deleted!', 'Goat removed.', 'success');
        fetchGoats();
      } catch {
        Swal.fire('Error', 'Failed to delete.', 'error');
      }
    }
  };

  return (
    <div className="my-goats-container">
      <button onClick={() => navigate('/customer-dashboard')} className="back-btn">⬅ Back</button>
      <h2>My Goats</h2>

      <div className="filter-controls">
        <input type="text" placeholder="Breed" value={breedFilter} onChange={(e) => setBreedFilter(e.target.value)} />
        <input type="number" placeholder="Min Price" value={minPriceFilter} onChange={(e) => setMinPriceFilter(e.target.value)} />
        <input type="number" placeholder="Max Price" value={maxPriceFilter} onChange={(e) => setMaxPriceFilter(e.target.value)} />
        <button onClick={resetFilters} className="reset-btn">Reset</button>
        <select onChange={handleSort} value={sortBy}>
          <option value="">Sort by</option>
          <option value="price">Price</option>
          <option value="weight">Weight</option>
        </select>
        <button onClick={() => {
          resetForm();
          setShowAddForm(!showAddForm);
        }} className="toggle-add-btn">
          {showAddForm ? 'Cancel' : '+ Add Goat'}
        </button>
      </div>

      {showAddForm && (
        <div className="goat-form-container">
          <h3>{isEditMode ? 'Edit Goat' : 'Register Goat'}</h3>
          <form onSubmit={handleSubmit}>
            <input type="text" name="goat_number" placeholder="Goat Number" value={formData.goat_number} onChange={handleFormChange} required />
            <input type="text" name="breed" placeholder="Breed" value={formData.breed} onChange={handleFormChange} required />
            <input type="date" name="dob" value={formData.dob} onChange={handleFormChange} required />
            <input type="number" name="weight" placeholder="Weight (kg)" value={formData.weight} onChange={handleFormChange} required />
            <input type="text" name="health_status" placeholder="Health Status" value={formData.health_status} onChange={handleFormChange} required />
            <input type="number" name="minimum_price" placeholder="Min Price" value={formData.minimum_price} onChange={handleFormChange} required />
            <input type="number" name="maximum_price" placeholder="Max Price" value={formData.maximum_price} onChange={handleFormChange} required />
            <input type="number" name="price" placeholder="Fixed Price (optional)" value={formData.price} onChange={handleFormChange} />
            <input type="file" name="image" accept="image/*" onChange={handleImageChange} />
            {mediaPreview && <img src={mediaPreview} alt="Preview" style={{ maxHeight: '200px' }} />}

            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} />
              {isDragActive ? <p>Drop files here...</p> : <p>Drag & drop images/videos (max {MAX_MEDIA})</p>}
            </div>

            <div className="preview-gallery">
              {mediaPreviewUrls.map((m, i) => (
                <div key={i} className="preview-item">
                  {m.type === 'image' ? <img src={m.url} alt="preview" /> : <video src={m.url} controls />}
                  <button type="button" onClick={() => removeMedia(i)}>Delete</button>
                </div>
              ))}
            </div>

            <button type="submit">{isEditMode ? 'Update Goat' : 'Add Goat'}</button>
          </form>
        </div>
      )}

      <div className="goat-grid">
        {filteredGoats.map(goat => (
          <div className="goat-card" key={goat.id}>
            <h4>Goat #{goat.goat_number} - {goat.breed}</h4>
            <img src={`http://localhost:5000${goat.image_url}`} alt="Goat" />
            <p>Weight: {goat.weight} kg</p>
            <p>Price: ₹{goat.price}</p>
            <p>Status: {goat.is_active ? 'Active' : 'Inactive'}</p>

            {healthStatuses[goat.id] && (
              <div className="health-summary">
                <p><strong>Last Check:</strong> {new Date(healthStatuses[goat.id].date_checked).toLocaleDateString()}</p>
                <p><strong>Type:</strong> {healthStatuses[goat.id].health_type}</p>
                <p><strong>Status:</strong> {healthStatuses[goat.id].status}</p>
              </div>
            )}

            <div className="goat-actions">
              <button onClick={() => handleEditGoat(goat)}>Edit</button>
              <button onClick={() => handleDeleteGoat(goat.id)}>Delete</button>
              <button onClick={() => setOpenHealthModal(goat.id)}>Health Records</button>
            </div>
          </div>
        ))}
      </div>

      {openHealthModal && (
        <HealthRecordModal goatId={openHealthModal} onClose={() => setOpenHealthModal(null)} />
      )}
    </div>
  );
};

export default MyGoats;
