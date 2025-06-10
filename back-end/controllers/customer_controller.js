const db = require('../config/db');

exports.getCustomerProfile = (req, res) => {
  if (!req.session.user || req.session.user.role !== 1) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = req.session.user.id;

  const sql = `
    SELECT 
      u.name AS username,     -- Using 'name' as display username
      u.name,
      u.email,
      u.phone_number,
      u.verified,
      c.address,
      c.photo,
      c.can_buy,
      c.can_sell
    FROM users u
    LEFT JOIN customers c ON c.user_id = u.id
    WHERE u.id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('❌ DB Error:', err.message);
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(results[0]);
  });
};
