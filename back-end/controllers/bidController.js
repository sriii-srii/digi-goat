const db = require('../config/db');

// ✅ Place a Bid
exports.placeBid = (req, res) => {
  const bidderId = req.session?.user?.id;
  const { goat_id, bid_amount } = req.body;

  if (!bidderId || !goat_id || !bid_amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const goatQuery = `
    SELECT minimum_price, maximum_price, price, is_sold 
    FROM goats 
    WHERE id = ? AND is_active = 1
  `;

  db.query(goatQuery, [goat_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err });

    if (results.length === 0) {
      return res.status(404).json({ error: 'Goat not found or inactive' });
    }

    const { minimum_price, maximum_price, price, is_sold } = results[0];

    if (is_sold) {
      return res.status(400).json({ error: 'This goat has already been sold. Bidding is closed.' });
    }

    if (bid_amount < minimum_price || bid_amount > maximum_price) {
      return res.status(400).json({
        error: `Bid must be between ₹${minimum_price} and ₹${maximum_price}`
      });
    }

    const totalBidsQuery = `SELECT COALESCE(SUM(bid_amount), 0) AS total FROM bids WHERE goat_id = ?`;

    db.query(totalBidsQuery, [goat_id], (err2, result2) => {
      if (err2) return res.status(500).json({ error: 'Failed to fetch bids', details: err2 });

      const totalExisting = parseFloat(result2[0].total);
      const remaining = parseFloat(price || 99999999) - totalExisting;

      if (bid_amount > remaining) {
        return res.status(400).json({
          error: `Only ₹${remaining.toFixed(2)} left to match the goat's price. Your bid is too high.`
        });
      }

      const insertQuery = `
        INSERT INTO bids (goat_id, bidder_id, bid_amount)
        VALUES (?, ?, ?)
      `;

      db.query(insertQuery, [goat_id, bidderId, bid_amount], (err3) => {
        if (err3) return res.status(500).json({ error: 'Bid failed', details: err3 });

        const newTotal = totalExisting + parseFloat(bid_amount);

        if (newTotal >= price) {
          const updateGoatQuery = `UPDATE goats SET is_sold = 1 WHERE id = ?`;
          db.query(updateGoatQuery, [goat_id], (err4) => {
            if (err4) return res.status(500).json({ error: 'Failed to update goat as sold', details: err4 });

            const contribQuery = `
              SELECT bidder_id AS user_id, SUM(bid_amount) AS total_contrib 
              FROM bids 
              WHERE goat_id = ? 
              GROUP BY bidder_id
            `;

            db.query(contribQuery, [goat_id], (err5, contributors) => {
              if (err5) return res.status(500).json({ error: 'Failed to calculate shares', details: err5 });

              const ownershipInserts = contributors.map(c => {
                const share = ((c.total_contrib / price) * 100).toFixed(2);
                return [goat_id, c.user_id, c.total_contrib.toFixed(2), share];
              });

              const ownershipQuery = `
                INSERT INTO goat_ownership (goat_id, user_id, amount, share_percent) 
                VALUES ?
              `;

              db.query(ownershipQuery, [ownershipInserts], (err6) => {
                if (err6) return res.status(500).json({ error: 'Failed to insert ownerships', details: err6 });

                return res.status(200).json({
                  message: 'Bid placed successfully. Goat has been fully funded and sold.',
                  sold: true
                });
              });
            });
          });
        } else {
          return res.status(200).json({ message: 'Bid placed successfully', sold: false });
        }
      });
    });
  });
};

// ✅ Get Bid History (for dashboard)
exports.getBidHistory = (req, res) => {
  const userId = req.session?.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const sql = `
    SELECT 
      b.id AS bid_id,
      b.goat_id,
      b.bid_amount,
      b.created_at,
      g.goat_number,
      g.breed,
      g.image_url
    FROM bids b
    JOIN goats g ON g.id = b.goat_id
    WHERE b.bidder_id = ?
    ORDER BY b.created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch bid history', details: err });
    res.json(results);
  });
};
