const db = require('../config/db');
const sendEmail = require('../utils/emailService'); // ✅ For seller notification

// 🚀 CREATE CAMPAIGN (Seller)
exports.createCampaign = (req, res) => {
  const {
    goat_id,
    title,
    description,
    target_amount,
    start_date,
    end_date
  } = req.body;

  const created_by = req.session.user?.id;

  if (!goat_id || !title || !target_amount || !start_date || !end_date || !created_by) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO campaigns (
      goat_id, title, description, target_amount, raised_amount, start_date, end_date, status, created_by
    ) VALUES (?, ?, ?, ?, 0, ?, ?, 'active', ?)
  `;

  db.query(sql, [goat_id, title, description || '', target_amount, start_date, end_date, created_by], (err) => {
    if (err) {
      console.error('❌ Campaign insert error:', err);
      return res.status(500).json({ error: 'Failed to create campaign' });
    }
    return res.status(200).json({ message: 'Campaign created successfully' });
  });
};

// 👀 VIEW ACTIVE CAMPAIGNS (Buyer)
exports.viewActiveCampaigns = (req, res) => {
  const sql = `
    SELECT c.*, g.breed, g.image_url
    FROM campaigns c
    JOIN goats g ON c.goat_id = g.id
    WHERE c.status = 'active' AND c.raised_amount < c.target_amount
    ORDER BY c.start_date DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to load campaigns' });
    res.json(results);
  });
};

// 💸 CONTRIBUTE TO CAMPAIGN (Buyer)
exports.contributeToCampaign = (req, res) => {
  const userId = req.session.user?.id;
  const { campaign_id, amount } = req.body;

  if (!userId || !campaign_id || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `SELECT target_amount, raised_amount FROM campaigns WHERE id = ? AND status = 'active'`;

  db.query(query, [campaign_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'Campaign not found or already completed' });
    }

    const { target_amount, raised_amount } = results[0];
    const totalAfter = parseFloat(raised_amount) + parseFloat(amount);

    if (totalAfter > target_amount) {
      return res.status(400).json({
        error: `Only ₹${(target_amount - raised_amount).toFixed(2)} remaining in this campaign.`
      });
    }

    const insertTransaction = `
      INSERT INTO transactions (campaign_id, user_id, amount, payment_status)
      VALUES (?, ?, ?, 'success')
    `;

    db.query(insertTransaction, [campaign_id, userId, amount], (err2) => {
      if (err2) return res.status(500).json({ error: 'Transaction failed' });

      const newStatus = totalAfter >= target_amount ? 'completed' : 'active';

      const updateCampaignSql = `
        UPDATE campaigns SET raised_amount = ?, status = ? WHERE id = ?
      `;
      db.query(updateCampaignSql, [totalAfter, newStatus, campaign_id], (err3) => {
        if (err3) return res.status(500).json({ error: 'Failed to update campaign' });

        // 📧 Notify seller if target met
        if (newStatus === 'completed') {
          db.query(
            `SELECT u.email, u.name 
             FROM campaigns c JOIN users u ON c.created_by = u.id 
             WHERE c.id = ?`,
            [campaign_id],
            (err4, rows) => {
              if (!err4 && rows.length) {
                const { email, name } = rows[0];
                sendEmail(
                  email,
                  '🎉 Campaign Funded!',
                  `Hello ${name},\n\nYour campaign (ID: ${campaign_id}) has reached 100% funding. Congratulations!`
                );
              }
            }
          );
        }

        res.status(200).json({
          message: 'Contribution successful!',
          completed: newStatus === 'completed'
        });
      });
    });
  });
};

// 📊 GET CONTRIBUTORS FOR A CAMPAIGN
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

// 🧾 GET MY CONTRIBUTIONS (Buyer view)
exports.myContributions = (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const sql = `
    SELECT 
      c.id AS campaign_id,
      c.title,
      g.breed,
      c.target_amount,
      c.raised_amount,
      c.status,
      SUM(t.amount) AS contributed
    FROM transactions t
    JOIN campaigns c ON t.campaign_id = c.id
    JOIN goats g ON c.goat_id = g.id
    WHERE t.user_id = ? AND t.payment_status = 'success'
    GROUP BY t.campaign_id
    ORDER BY c.start_date DESC
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Server error' });

    const data = rows.map(r => ({
      campaign_id: r.campaign_id,
      title: r.title,
      breed: r.breed,
      contributed: parseFloat(r.contributed),
      target_amount: parseFloat(r.target_amount),
      raised_amount: parseFloat(r.raised_amount),
      ownership_percentage: parseFloat(((r.contributed / r.raised_amount) * 100).toFixed(2)),
      status: r.status
    }));

    res.json(data);
  });
};
