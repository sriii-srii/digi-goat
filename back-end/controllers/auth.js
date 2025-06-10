const db = require('../config/db');
const bcrypt = require('bcrypt');

// ✅ Login user and set session
exports.login = (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ?';

  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      verified: user.verified,
      name: user.name,
      photo: user.photo // ✅ store photo path in session
    };

    req.session.save(err => {
      if (err) return res.status(500).json({ error: 'Failed to save session' });

      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          verified: user.verified,
          photo: user.photo // ✅ return photo to frontend
        }
      });
    });
  });
};

// ✅ Session checker for frontend (AddGoat, etc.)
exports.getSession = (req, res) => {
  if (req.session && req.session.user) {
    return res.status(200).json({ user: req.session.user });
  } else {
    return res.status(401).json({ message: 'No active session' });
  }
};
