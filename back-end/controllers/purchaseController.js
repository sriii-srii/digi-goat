const db = require('../config/db');

// 🛒 Purchase a goat
exports.purchaseGoat = (req, res) => {
  const buyerId = req.session?.user?.id;
  const { goat_id } = req.body;

  if (!buyerId || !goat_id) {
    return res.status(400).json({ error: 'Missing buyer or goat ID' });
  }

  const sql = `
    INSERT INTO purchases (buyer_id, goat_id)
    VALUES (?, ?)
  `;

  db.query(sql, [buyerId, goat_id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Goat purchased successfully' });
  });
};

// 🧾 Get purchased goats for logged-in user
exports.getMyPurchases = (req, res) => {
  const buyerId = req.session?.user?.id;
  if (!buyerId) return res.status(401).json({ error: 'Unauthorized' });

  const sql = `
    SELECT p.*, g.goat_number, g.breed, g.weight, g.image_url, p.rating, p.review
    FROM purchases p
    JOIN goats g ON g.id = p.goat_id
    WHERE p.buyer_id = ?
  `;

  db.query(sql, [buyerId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// ⭐ Submit review
exports.submitReview = (req, res) => {
  const buyerId = req.session?.user?.id;
  const { purchase_id, rating, review } = req.body;

  if (!buyerId || !purchase_id || !rating) {
    return res.status(400).json({ error: 'Missing data' });
  }

  const sql = `
    UPDATE purchases
    SET rating = ?, review = ?
    WHERE id = ? AND buyer_id = ?
  `;

  db.query(sql, [rating, review, purchase_id, buyerId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Review submitted successfully' });
  });
};
