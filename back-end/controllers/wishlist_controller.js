const db = require('../config/db');

// Get wishlist goats for current user
exports.getMyWishlist = (req, res) => {
  const userId = req.session?.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const sql = `
    SELECT g.*, w.added_at 
    FROM wishlist w
    JOIN goats g ON g.id = w.goat_id
    WHERE w.user_id = ?
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

// Add goat to wishlist
exports.addToWishlist = (req, res) => {
  const userId = req.session?.user?.id;
  const { goat_id } = req.body;
  if (!userId || !goat_id) return res.status(400).json({ error: 'Missing data' });

  const sql = `INSERT IGNORE INTO wishlist (user_id, goat_id) VALUES (?, ?)`;
  db.query(sql, [userId, goat_id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Goat added to wishlist' });
  });
};

// Remove goat from wishlist
exports.removeFromWishlist = (req, res) => {
  const userId = req.session?.user?.id;
  const goatId = req.params.goatId;
  if (!userId || !goatId) return res.status(400).json({ error: 'Missing data' });

  const sql = `DELETE FROM wishlist WHERE user_id = ? AND goat_id = ?`;
  db.query(sql, [userId, goatId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Goat removed from wishlist' });
  });
};
