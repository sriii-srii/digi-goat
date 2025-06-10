// controllers/customer.js
const db = require('../config/db');

exports.getCustomerProfile = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const email = req.session.user.email;

  const sql = `
    SELECT u.username, u.email, c.phone, c.address, c.can_buy, c.can_sell
    FROM users u
    JOIN customers c ON u.id = c.user_id
    WHERE u.email = ?
  `;

  db.query(sql, [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    if (result.length === 0) return res.status(404).json({ message: "Customer not found" });

    res.json(result[0]);
  });
};
