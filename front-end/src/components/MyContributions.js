import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const MyContributions = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/campaigns/my-contributions', { withCredentials: true })
      .then(res => setData(res.data))
      .catch(err => Swal.fire('Error', 'Could not load data', 'error'));
  }, []);

  const filtered = data.filter(d => filter === 'all' || d.status === filter);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('My Contributions', 14, 20);
    const tableData = filtered.map((r, idx) => [
      idx + 1, r.title, r.breed, `₹${r.contributed}`, `${r.ownership_percentage}%`, r.status
    ]);
    doc.autoTable({
      head: [['#', 'Campaign', 'Breed', 'Contributed', 'Ownership %', 'Status']],
      body: tableData,
      startY: 30
    });
    doc.save('my_contributions.pdf');
  };

  return (
    <div className="my-contrib-wrapper">
      <h2>My Contributions</h2>
      <div className="filter-bar">
        <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>All</button>
        <button onClick={() => setFilter('active')} className={filter === 'active' ? 'active' : ''}>Active</button>
        <button onClick={() => setFilter('completed')} className={filter === 'completed' ? 'active' : ''}>Completed</button>
      </div>
      <button onClick={exportPDF}>📄 Download PDF</button>
      <table className="contrib-table">
        <thead>
          <tr><th>#</th><th>Title</th><th>Breed</th><th>Contributed</th><th>Ownership %</th><th>Status</th><th>Details</th></tr>
        </thead>
        <tbody>
          {filtered.map((r, i) => (
            <tr key={r.campaign_id}>
              <td>{i+1}</td>
              <td>{r.title}</td>
              <td>{r.breed}</td>
              <td>₹{r.contributed}</td>
              <td>{r.ownership_percentage}%</td>
              <td>{r.status}</td>
              <td><button onClick={() => navigate(`/campaign/${r.campaign_id}/contributors`)}>View</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyContributions;
