import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './css/MyGoats.css';
import './css/goat.css';

axios.defaults.withCredentials = true;

const MyGoats = () => {
  const [goats, setGoats] = useState([]);
  const [filteredGoats, setFilteredGoats] = useState([]);
  const [breedFilter, setBreedFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [userId, setUserId] = useState(null);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // 👁️ Image preview
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

  const handleFilter = (e) => {
    const breed = e.target.value;
    setBreedFilter(breed);
    const filtered = goats.filter(goat =>
      breed === '' || goat.breed.toLowerCase().includes(breed.toLowerCase())
    );
    setFilteredGoats(filtered);
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
      setPreviewUrl(URL.createObjectURL(file)); // 👁️ show preview
    } else {
      setImage(null);
      setPreviewUrl(null);
      Swal.fire('Error', 'Please select a valid image file.', 'error');
    }
  };

  const handleAddGoatSubmit = async (e) => {
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
      document.querySelector('input[name="image"]').value = ''; // clear input
      fetchGoats();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to add goat.', 'error');
    }
  };

  return (
    <div className="my-goats-container">
      <h2>My Goats</h2>

      <div className="filter-controls">
        <input type="text" placeholder="Filter by breed" value={breedFilter} onChange={handleFilter} />
        <select onChange={handleSort} value={sortBy}>
          <option value="">Sort by</option>
          <option value="price">Price</option>
          <option value="weight">Weight</option>
        </select>
        <button onClick={() => setShowAddForm(!showAddForm)} className="toggle-add-btn">
          {showAddForm ? 'Cancel' : '+ Add Goat'}
        </button>
      </div>

      {showAddForm && (
        <div className="goat-form-container">
          <h3>Register Goat</h3>
          <form onSubmit={handleAddGoatSubmit} encType="multipart/form-data">
            <input type="text" name="goat_number" placeholder="Goat Number" value={formData.goat_number} onChange={handleAddFormChange} required />
            <input type="text" name="breed" placeholder="Breed" value={formData.breed} onChange={handleAddFormChange} required />
            <input type="date" name="dob" value={formData.dob} onChange={handleAddFormChange} required />
            <input type="number" step="0.01" name="weight" placeholder="Weight (kg)" value={formData.weight} onChange={handleAddFormChange} required />
            <input type="text" name="health_status" placeholder="Health Status" value={formData.health_status} onChange={handleAddFormChange} required />
            <input type="number" step="0.01" name="minimum_price" placeholder="Minimum Price" value={formData.minimum_price} onChange={handleAddFormChange} required />
            <input type="number" step="0.01" name="maximum_price" placeholder="Maximum Price" value={formData.maximum_price} onChange={handleAddFormChange} required />
            <input type="number" step="0.01" name="price" placeholder="Fixed Price (optional)" value={formData.price} onChange={handleAddFormChange} />
            <input type="file" name="image" accept="image/*" onChange={handleAddImageChange} required />

            {/* 👁️ Live Image Preview */}
            {previewUrl && (
              <div style={{ marginTop: '10px' }}>
                <p style={{ fontWeight: 'bold' }}>Preview:</p>
                <img
                  src={previewUrl}
                  alt="Goat Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '1px solid #ccc'
                  }}
                />
              </div>
            )}

            <button type="submit">Add Goat</button>
          </form>
        </div>
      )}

      {/* Render goats list however you'd like... */}
    </div>
  );
};

export default MyGoats;
