const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'store_rating_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

// Database initialization
const initDatabase = async () => {
  try {
    // Create database if it doesn't exist
    const connection = mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    await connection.promise().execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'store_rating_db'}`);
    console.log('Database created or already exists');
    
    connection.end();

    // Create tables
    await createTables();
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

const createTables = async () => {
  try {
    // Create users table if not exists
    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        address TEXT,
        role ENUM('admin', 'user', 'store_owner') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Stores table (base definition – later we attempt to add optional columns)
    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        address TEXT,
        owner_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Ensure optional / newer columns exist (ignore duplicate errors)
    await ensureStoreOptionalColumns();

    // Ratings table (now includes optional comment column in base definition)
    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        store_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_store (user_id, store_id)
      )
    `);

    // Ensure ratings optional columns (for existing installations created before comment column)
    await ensureRatingsOptionalColumns();

    await createDefaultAdmin();
    await seedSampleStores();

    console.log('Tables ensured (no destructive reset performed)');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

const createDefaultAdmin = async () => {
  try {
    const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    await promisePool.execute(`
      INSERT IGNORE INTO users (name, email, password, address, role) 
      VALUES (?, ?, ?, ?, ?)
    `, [
      'System Administrator',
      'admin@storerating.com',
      hashedPassword,
      'System Administration Office',
  'admin'
    ]);
    
    console.log('Default admin user created');
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// Seed sample stores if none exist
const seedSampleStores = async () => {
  try {
    const [rows] = await promisePool.execute('SELECT COUNT(*) AS count FROM stores');
    if (rows[0].count >= 6) { // threshold instead of just >0
      console.log('Sample stores already present (skipping seeding)');
      return;
    }

    const sampleStores = [
      { name: 'Pizza Paradise', email: 'contact@pizzaparadise.com', address: '123 Main Street, Downtown', description: 'Artisan pizzas with fresh ingredients and wood-fired flavor.', category: 'restaurant', phone: '(555) 111-1111', website: 'https://pizzaparadise.example.com' },
      { name: 'TechMart Electronics', email: 'info@techmart.com', address: '456 Tech Avenue, Electronics District', description: 'Latest gadgets, computers, and accessories with expert support.', category: 'electronics', phone: '(555) 222-2222', website: 'https://techmart.example.com' },
      { name: 'Fashion Fusion', email: 'hello@fashionfusion.com', address: '789 Style Boulevard, Shopping Center', description: 'Trendy apparel and accessories for all styles and seasons.', category: 'clothing', phone: '(555) 333-3333', website: 'https://fashionfusion.example.com' },
      { name: 'Green Grocery', email: 'orders@greengrocery.com', address: '321 Fresh Lane, Market Square', description: 'Organic produce and locally sourced fresh groceries.', category: 'grocery', phone: '(555) 444-4444', website: 'https://greengrocery.example.com' },
      { name: 'Coffee Corner', email: 'info@coffeecorner.com', address: '654 Brew Street, Arts District', description: 'Specialty coffee, pastries, and a cozy atmosphere.', category: 'cafe', phone: '(555) 555-5555', website: 'https://coffeecorner.example.com' },
      { name: 'Book Haven', email: 'contact@bookhaven.com', address: '987 Reading Road, University Area', description: 'Independent bookstore with curated titles and reading events.', category: 'bookstore', phone: '(555) 666-6666', website: 'https://bookhaven.example.com' }
    ];

    for (const s of sampleStores) {
      await promisePool.execute(
        `INSERT IGNORE INTO stores (name, email, address, description, category, phone, website, owner_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NOW(), NOW())`,
        [s.name, s.email, s.address, s.description, s.category, s.phone, s.website]
      );
    }
    console.log('Seeded sample stores (ensured minimum set)');
  } catch (error) {
    console.error('Error seeding sample stores:', error);
  }
};

// Ensure optional columns exist for stores table
async function ensureStoreOptionalColumns() {
  const optionalColumns = [
    { name: 'description', ddl: 'ADD COLUMN description TEXT NULL' },
    { name: 'category', ddl: "ADD COLUMN category VARCHAR(50) NULL" },
    { name: 'phone', ddl: "ADD COLUMN phone VARCHAR(30) NULL" },
  { name: 'website', ddl: "ADD COLUMN website VARCHAR(255) NULL" },
  // New optional column for store image (Cloudinary URL)
  { name: 'image_url', ddl: 'ADD COLUMN image_url VARCHAR(512) NULL' }
  ];

  for (const col of optionalColumns) {
    try {
      await promisePool.execute(`ALTER TABLE stores ${col.ddl}`);
      console.log(`Added column stores.${col.name}`);
    } catch (err) {
      // ER_DUP_FIELDNAME = 1060 – ignore if already exists
      if (err.code !== 'ER_DUP_FIELDNAME') {
        // MySQL 8 supports IF NOT EXISTS, but in case older version just ignore duplicates
        // eslint-disable-next-line no-console
        console.warn(`Column ${col.name} ensure warning:`, err.message);
      }
    }
  }
}

// Ensure optional columns exist for ratings table (e.g., comment added later)
async function ensureRatingsOptionalColumns() {
  const optionalColumns = [
    { name: 'comment', ddl: 'ADD COLUMN comment TEXT NULL' }
  ];
  for (const col of optionalColumns) {
    try {
      await promisePool.execute(`ALTER TABLE ratings ${col.ddl}`);
      console.log(`Added column ratings.${col.name}`);
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') {
        // eslint-disable-next-line no-console
        console.warn(`Column ratings.${col.name} ensure warning:`, err.message);
      }
    }
  }
}

module.exports = { promisePool, initDatabase };
