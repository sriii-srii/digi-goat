const db = require('../config/db');

exports.getContributors = (req, res) => {
  const campId = req.params.id;

  db.query(
    `SELECT raised_amount, target_amount FROM campaigns WHERE id = ?`,
    [campId],
    (err, campRes) => {
      if (err || !campRes.length) return res.status(404).json({ error: 'Campaign not found' });

      const { raised_amount, target_amount } = campRes[0];

      db.query(
        `SELECT t.user_id, u.name, SUM(t.amount) AS amount
         FROM transactions t
         JOIN users u ON u.id = t.user_id
         WHERE t.campaign_id = ? AND t.payment_status = 'success'
         GROUP BY t.user_id`,
        [campId],
        (err2, rows) => {
          if (err2) return res.status(500).json({ error: 'Failed to fetch transactions' });

          const contributors = rows.map((r, i) => {
            const share = raised_amount ? (r.amount / raised_amount) * 100 : 0;
            return {
              serial: i + 1,
              user_id: r.user_id,
              name: r.name,
              amount: parseFloat(r.amount),
              ownership_percentage: parseFloat(share.toFixed(2))
            };
          });

          res.json({ raised_amount, target_amount, contributors });
        }
      );
    }
  );
};
