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
    const [rows] = await conn.execute('SHOW CREATE TABLE users');
    console.log(rows[0]['Create Table']);
    const [auto] = await conn.execute("SELECT EXTRA FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME='users' AND COLUMN_NAME='id'",[process.env.DB_NAME]);
    console.log('users.id EXTRA:', auto[0]?.EXTRA);
  } catch (e) { console.error(e); } finally { await conn.end(); }
})();
