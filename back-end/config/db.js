const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3310,            // ✅ Your custom port
  user: 'root',
  password: '',
  database: 'digi-goat'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connected to MySQL database "digi-goat"');
  }
});

module.exports = connection;
