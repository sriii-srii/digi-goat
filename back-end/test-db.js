// test-db.js ✅ Simple DB tester
const db = require('./config/db');

(async () => {
  try {
    const [rows] = await db.query('SHOW TABLES');
    console.log('✅ DB Connected! Tables:', rows);
  } catch (err) {
    console.error('❌ DB Connection failed:', err.message);
  }
})();
