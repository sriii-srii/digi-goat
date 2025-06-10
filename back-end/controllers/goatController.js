const db = require('../config/db');
const path = require('path');

// 🐐 Add a new goat
exports.addGoat = (req, res) => {
  const {
    owner_id,
    goat_number,
    breed,
    dob,
    weight,
    health_status,
    minimum_price,
    maximum_price,
    price,
  } = req.body;

  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  const is_active = 1;

  if (
    !owner_id ||
    !goat_number ||
    !breed ||
    !dob ||
    !weight ||
    !health_status ||
    !minimum_price ||
    !maximum_price ||
    !image_url
  ) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const verifySql = 'SELECT * FROM users WHERE id = ? AND verified = 1 AND role = 1';

  db.query(verifySql, [owner_id], (verifyErr, verifyResult) => {
    if (verifyErr) return res.status(500).json({ error: 'User verification error' });

    if (verifyResult.length === 0) {
      return res.status(403).json({ error: 'User not verified or unauthorized' });
    }

    const checkSql = 'SELECT * FROM goats WHERE goat_number = ?';
    db.query(checkSql, [goat_number], (err, result) => {
      if (err) return res.status(500).json({ error: 'Duplicate check error' });

      if (result.length > 0) {
        return res.status(400).json({ error: 'Goat number already exists' });
      }

      const insertSql = `
        INSERT INTO goats (
          owner_id, goat_number, breed, dob, weight, health_status,
          minimum_price, maximum_price, price, is_active, image_url, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      db.query(insertSql, [
        owner_id,
        goat_number,
        breed,
        dob,
        weight,
        health_status,
        minimum_price,
        maximum_price,
        price || null,
        is_active,
        image_url,
      ], (insertErr) => {
        if (insertErr) return res.status(500).json({ error: 'Insert failed' });

        return res.status(200).json({ message: 'Goat added successfully' });
      });
    });
  });
};

// 🐐 Get goats owned by logged-in user
exports.getMyGoats = (req, res) => {
  const ownerId = req.session.user?.id;
  if (!ownerId) return res.status(401).json({ error: 'Not logged in' });

  const sql = 'SELECT * FROM goats WHERE owner_id = ? ORDER BY created_at DESC';
  db.query(sql, [ownerId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Fetch failed' });

    res.status(200).json(result);
  });
};

// 🛍️ Get market goats (not owned by current user)
exports.getMarketGoats = (req, res) => {
  const userId = req.session?.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const sql = `
    SELECT * FROM goats
    WHERE owner_id != ? AND is_active = 1
    ORDER BY created_at DESC
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(result);
  });
};

// 📝 Update a goat
exports.updateGoat = (req, res) => {
  const goatId = req.params.id;
  const {
    goat_number,
    breed,
    dob,
    weight,
    health_status,
    minimum_price,
    maximum_price,
    price
  } = req.body;

  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  let sql = `
    UPDATE goats SET
      goat_number = ?, breed = ?, dob = ?, weight = ?, health_status = ?,
      minimum_price = ?, maximum_price = ?, price = ?
  `;
  const params = [
    goat_number,
    breed,
    dob,
    weight,
    health_status,
    minimum_price,
    maximum_price,
    price || null
  ];

  if (image_url) {
    sql += `, image_url = ?`;
    params.push(image_url);
  }

  sql += ` WHERE id = ?`;
  params.push(goatId);

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to update goat', details: err });
    res.status(200).json({ message: 'Goat updated successfully' });
  });
};

// 🗑️ Delete a goat
exports.deleteGoat = (req, res) => {
  const goatId = req.params.id;
  const sql = 'DELETE FROM goats WHERE id = ?';
  db.query(sql, [goatId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Delete failed' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Goat not found' });

    res.status(200).json({ message: 'Goat deleted successfully' });
  });
};
