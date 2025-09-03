const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  try {
    const [rows] = await conn.execute('SELECT id, name, email, address, description, category FROM stores ORDER BY id');
    console.log(`Stores count: ${rows.length}`);
    console.table(rows);
  } catch (e) {
    console.error('Error reading stores:', e.message);
  } finally {
    await conn.end();
  }
})();
