const db = require('../config/db');

// ✅ Goat Requests
exports.getGoatRequests = (req, res) => {
  const query = `
    SELECT g.*, u.name AS owner_name, u.email AS email
    FROM goats g
    JOIN users u ON g.owner_id = u.id
    ORDER BY g.created_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json(results);
  });
};

exports.updateGoatStatus = (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  if (!['approved', 'rejected'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action' });
  }

  db.query('UPDATE goats SET status = ? WHERE id = ?', [action, id], (err) => {
    if (err) return res.status(500).json({ error: 'Update failed' });
    res.json({ message: `Goat request ${action}` });
  });
};

// ✅ Customer Profile
exports.getCustomerProfile = (req, res) => {
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
    if (err) return res.status(500).json({ error: 'Failed to fetch profile' });
    if (results.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(results[0]);
  });
};

// ✅ Campaign Moderation
exports.getAllCampaigns = (req, res) => {
  const sql = `
    SELECT c.*, u.name AS creator_name, g.breed, g.image_url
    FROM campaigns c
    JOIN users u ON c.created_by = u.id
    JOIN goats g ON c.goat_id = g.id
    ORDER BY c.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to load campaigns' });
    res.json(results);
  });
};

exports.updateCampaignStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const valid = ['active', 'completed', 'rejected'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  db.query(`UPDATE campaigns SET status = ? WHERE id = ?`, [status, id], (err) => {
    if (err) return res.status(500).json({ error: 'Status update failed' });
    res.json({ message: 'Status updated' });
  });
};
