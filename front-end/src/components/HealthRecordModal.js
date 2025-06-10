import React, { useEffect, useState } from 'react';
import axios from 'axios';
import HealthRecordForm from './HealthRecordForm';
import './css/healthRecords.css';

const HealthRecordModal = ({ goatId, onClose }) => {
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const fetchRecords = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/health/goat/${goatId}`);
      setRecords(res.data);
    } catch (err) {
      console.error('⚠️ Error fetching records:', err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [goatId]);

  const handleDelete = async (recordId) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/health/${recordId}`);
      fetchRecords();
    } catch (err) {
      console.error('⚠️ Delete error:', err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content health-record-modal" onClick={(e) => e.stopPropagation()}>
        <h3>🐐 Health Records</h3>
        {records.length === 0 ? (
          <p>No records found.</p>
        ) : (
          <div className="health-records-list">
            {records.map((rec) => (
              <div className="record" key={rec.id}>
                <p><strong>Date:</strong> {new Date(rec.date_checked).toLocaleDateString()}</p>
                <p><strong>Type:</strong> {rec.health_type}</p>
                <p><strong>Status:</strong> {rec.status}</p>
                <div>
                  <button onClick={() => { setShowForm(true); setEditRecord(rec); }}>Edit</button>
                  <button onClick={() => handleDelete(rec.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => { setShowForm(true); setEditRecord(null); }}>
          ➕ {records.length ? 'Add Another Record' : 'Add Health Record'}
        </button>

        {showForm && (
          <HealthRecordForm
            goatId={goatId}
            existing={editRecord}
            onSuccess={() => { setShowForm(false); fetchRecords(); }}
          />
        )}

        <button onClick={onClose} style={{ marginTop: '20px' }}>❌ Close</button>
      </div>
    </div>
  );
};

export default HealthRecordModal;
