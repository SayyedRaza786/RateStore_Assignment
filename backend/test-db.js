const mysql = require('mysql2');
require('dotenv').config();

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Create connection
    const connection = mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    // Test basic connection
    await connection.promise().execute('SELECT 1 as test');
    console.log('✅ MySQL connection successful');

    // Create database if it doesn't exist
    await connection.promise().execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'store_rating_db'}`);
    console.log('✅ Database created or already exists');

    // Switch to our database
    await connection.promise().execute(`USE ${process.env.DB_NAME || 'store_rating_db'}`);
    
    // Create users table
    await connection.promise().execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        address TEXT(400),
        role ENUM('admin', 'user', 'store_owner') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Create stores table
    await connection.promise().execute(`
      CREATE TABLE IF NOT EXISTS stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        address TEXT(400),
        owner_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Stores table created');

    // Create ratings table
    await connection.promise().execute(`
      CREATE TABLE IF NOT EXISTS ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        store_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_store (user_id, store_id)
      )
    `);
    console.log('✅ Ratings table created');

    // Create default admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    await connection.promise().execute(`
      INSERT IGNORE INTO users (name, email, password, address, role) 
      VALUES (?, ?, ?, ?, ?)
    `, [
      'System Administrator',
      'admin@storerating.com',
      hashedPassword,
      'System Administration Office',
      'admin'
    ]);
    console.log('✅ Default admin user created');

    // Show all tables
    const [tables] = await connection.promise().execute('SHOW TABLES');
    console.log('\n📋 Database tables:');
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

    // Show users in database
    const [users] = await connection.promise().execute('SELECT id, name, email, role FROM users');
    console.log('\n👤 Users in database:');
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    connection.end();
    console.log('\n✅ Database setup complete! Your app can now handle login/registration.');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

testDatabase();
