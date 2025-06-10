import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const HealthRecordForm = ({ goatId, existing, onSuccess }) => {
  const [form, setForm] = useState({
    date_checked: existing?.date_checked?.split('T')[0] || '',
    health_type: existing?.health_type || 'checkup',
    description: existing?.description || '',
    veterinarian: existing?.veterinarian || '',
    next_due_date: existing?.next_due_date?.split('T')[0] || '',
    status: existing?.status || 'Healthy',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.date_checked || !form.health_type || !form.status) {
      Swal.fire('Error', 'Date, Type and Status are required.', 'error');
      return;
    }

    try {
      if (existing) {
        await axios.put(`http://localhost:5000/api/health/${existing.id}`, form);
        Swal.fire('Updated', 'Health record updated.', 'success');
      } else {
        await axios.post('http://localhost:5000/api/health/add', {
          goat_id: goatId,
          ...form
        });
        Swal.fire('Added', 'Health record added.', 'success');
      }

      onSuccess();
    } catch (err) {
      console.error('💥 API error:', err.response?.data || err);
      Swal.fire('Error', 'Operation failed. Check console for details.', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="health-form">
      <input type="date" name="date_checked" value={form.date_checked} onChange={handleChange} required />
      <select name="health_type" value={form.health_type} onChange={handleChange}>
        <option value="checkup">Checkup</option>
        <option value="vaccination">Vaccination</option>
        <option value="deworming">Deworming</option>
      </select>
      <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
      <input type="text" name="veterinarian" placeholder="Veterinarian" value={form.veterinarian} onChange={handleChange} />
      <input type="date" name="next_due_date" value={form.next_due_date} onChange={handleChange} />
      <select name="status" value={form.status} onChange={handleChange}>
        <option value="Healthy">Healthy</option>
        <option value="Needs Attention">Needs Attention</option>
        <option value="Critical">Critical</option>
      </select>
      <button type="submit">{existing ? 'Update' : 'Add'} Record</button>
    </form>
  );
};

export default HealthRecordForm;
