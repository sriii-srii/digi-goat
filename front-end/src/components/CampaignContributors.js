import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

// ✅ Correct imports to register plugin properly
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

const CampaignContributors = () => {
  const { id } = useParams();
  const [data, setData] = useState({ raised_amount: 0, target_amount: 0, contributors: [] });

  useEffect(() => {
    axios.get(`http://localhost:5000/api/campaigns/${id}/contributors`, { withCredentials: true })
      .then(res => setData(res.data))
      .catch(console.error);
  }, [id]);

  const { raised_amount, target_amount, contributors } = data;
  const maxShare = Math.max(...contributors.map(c => c.ownership_percentage), 0);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Ownership Report', 14, 20);
    doc.text(`Raised ₹${raised_amount} / ₹${target_amount}`, 14, 26);

    const rows = contributors.map(c => [
      c.serial,
      c.name,
      `₹${c.amount}`,
      `${c.ownership_percentage}%`,
      c.ownership_percentage === maxShare ? '🏆' : ''
    ]);

    autoTable(doc, {
      head: [['#', 'Contributor', 'Amount', 'Ownership %', 'Top?']],
      body: rows,
      startY: 30
    });

    doc.save(`campaign_${id}_report.pdf`);
  };

  return (
    <div className="ownership-wrapper">
      <h2>Campaign Ownership Breakdown</h2>
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${(raised_amount / target_amount) * 100}%` }} />
        <span>₹{raised_amount} / ₹{target_amount}</span>
      </div>
      <button onClick={exportPDF}>📄 Download Ownership PDF</button>
      <table className="ownership-table">
        <thead>
          <tr><th>#</th><th>Name</th><th>Amount</th><th>% Ownership</th><th>Top Contributor</th></tr>
        </thead>
        <tbody>
          {contributors.map(c => (
            <tr key={c.user_id}>
              <td>{c.serial}</td>
              <td>{c.name}</td>
              <td>₹{c.amount}</td>
              <td>{c.ownership_percentage}%</td>
              <td>{c.ownership_percentage === maxShare ? '🏆' : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CampaignContributors;
