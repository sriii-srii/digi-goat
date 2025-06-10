const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ✅ GET: All goat requests (not just pending)
router.get('/goat-requests', (req, res) => {
  const query = `
    SELECT g.*, u.name AS owner_name, u.email AS email
    FROM goats g
    JOIN users u ON g.owner_id = u.id
    ORDER BY g.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error fetching goat requests:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    res.json(results);
  });
});

// ✅ PATCH: Approve or reject a goat
router.patch('/goat-requests/:id', (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  if (!['approved', 'rejected'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action' });
  }

  const updateQuery = 'UPDATE goats SET status = ? WHERE id = ?';

  db.query(updateQuery, [action, id], (err) => {
    if (err) {
      console.error('❌ Error updating status:', err);
      return res.status(500).json({ error: 'Update failed' });
    }
    res.json({ message: `Goat request ${action}` });
  });
});

// ✅ FIXED: GET Customer Profile by User ID (no c.username)
router.get('/customer/:id', (req, res) => {
  const userId = req.params.id;

  const query = `
    SELECT 
      u.name AS username, u.email, u.phone_number, u.verified,
      c.address, c.photo, c.can_buy, c.can_sell
    FROM users u
    JOIN customers c ON c.user_id = u.id
    WHERE u.id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching customer profile:', err);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(results[0]);
  });
});

module.exports = router;
