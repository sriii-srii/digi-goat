const db = require('../config/db');
const path = require('path');
const fs = require('fs');

exports.uploadMedia = (req, res) => {
  const { goat_id } = req.body;
  const userId = req.session.user.id;

  if (!goat_id || !req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Missing fields or no files' });
  }

  const mediaRecords = req.files.map(file => {
    const ext = path.extname(file.filename).toLowerCase();
    const type = ['.jpg', '.jpeg', '.png'].includes(ext) ? 'image'
               : ['.mp4', '.webm'].includes(ext) ? 'video'
               : null;

    if (!type) return null;

    return [goat_id, type, `/uploads/${file.filename}`, userId];
  }).filter(Boolean);

  if (mediaRecords.length === 0) {
    return res.status(400).json({ error: 'Unsupported file types' });
  }

  const sql = `
    INSERT INTO goat_media (goat_id, media_type, media_url, uploaded_by, uploaded_at)
    VALUES ?
  `;

  db.query(sql, [mediaRecords], (err) => {
    if (err) return res.status(500).json({ error: 'Upload failed' });
    res.status(200).json({ message: 'Media uploaded' });
  });
};

exports.getMediaByGoat = (req, res) => {
  const goatId = req.params.goatId;
  const sql = 'SELECT * FROM goat_media WHERE goat_id = ? ORDER BY uploaded_at DESC';
  db.query(sql, [goatId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch media' });
    res.status(200).json(results);
  });
};

exports.deleteMedia = (req, res) => {
  const id = req.params.id;
  const sql = 'SELECT media_url FROM goat_media WHERE id = ?';
  
  db.query(sql, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }

    const filePath = path.join(__dirname, '..', results[0].media_url);
    fs.unlink(filePath, (fsErr) => {
      if (fsErr) console.warn('File delete error:', fsErr);
    });

    db.query('DELETE FROM goat_media WHERE id = ?', [id], (delErr) => {
      if (delErr) return res.status(500).json({ error: 'Delete failed' });
      res.status(200).json({ message: 'Media deleted' });
    });
  });
};
