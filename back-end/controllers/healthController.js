const db = require('../config/db');

// ✅ Get all health records for a specific goat
exports.getHealthRecordsByGoat = (req, res) => {
  const goatId = req.params.goatId;
  const sql = 'SELECT * FROM goat_health WHERE goat_id = ? ORDER BY date_checked DESC';

  db.query(sql, [goatId], (err, result) => {
    if (err) {
      console.error('Fetch error:', err);
      return res.status(500).json({ error: 'Failed to fetch records' });
    }
    res.status(200).json(result);
  });
};

// ✅ Add new health record
exports.addHealthRecord = (req, res) => {
  const {
    goat_id,
    date_checked,
    health_type,
    description,
    veterinarian,
    next_due_date,
    status
  } = req.body;

  if (!goat_id || !date_checked || !health_type || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO goat_health (
      goat_id, date_checked, health_type, description,
      veterinarian, next_due_date, status, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(sql, [goat_id, date_checked, health_type, description, veterinarian, next_due_date, status], (err) => {
    if (err) {
      console.error('INSERT ERROR', err);
      return res.status(500).json({ error: 'Failed to add record', dbErr: err });
    }
    res.status(200).json({ message: 'Record added successfully' });
  });
};

// ✅ Update existing health record
exports.updateHealthRecord = (req, res) => {
  const id = req.params.id;
  const { date_checked, health_type, description, veterinarian, next_due_date, status } = req.body;

  const sql = `
    UPDATE goat_health
    SET date_checked = ?, health_type = ?, description = ?,
        veterinarian = ?, next_due_date = ?, status = ?
    WHERE id = ?
  `;

  db.query(sql, [date_checked, health_type, description, veterinarian, next_due_date, status, id], (err) => {
    if (err) {
      console.error('UPDATE ERROR', err);
      return res.status(500).json({ error: 'Failed to update record' });
    }
    res.status(200).json({ message: 'Record updated successfully' });
  });
};

// ✅ Delete health record
exports.deleteHealthRecord = (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM goat_health WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Delete failed' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Record not found' });

    res.status(200).json({ message: 'Record deleted successfully' });
  });
};

// ✅ Get latest health status for a goat
exports.getLatestHealthStatus = (req, res) => {
  const goatId = req.params.goatId;

  const sql = `
    SELECT status, health_type, date_checked
    FROM goat_health
    WHERE goat_id = ?
    ORDER BY date_checked DESC
    LIMIT 1
  `;

  db.query(sql, [goatId], (err, result) => {
    if (err) {
      console.error('Fetch error:', err);
      return res.status(500).json({ error: 'Failed to fetch latest health status' });
    }
    if (result.length === 0) {
      return res.status(200).json({ status: 'No Records' });
    }
    res.status(200).json(result[0]);
  });
};
