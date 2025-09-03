require('dotenv').config();
const mysql = require('mysql2/promise');

const createSampleStores = async () => {
  console.log('🚀 Starting sample stores creation...');
  
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME || 'store_rating_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    const stores = [
      {
        name: 'Pizza Paradise',
        email: 'contact@pizzaparadise.com',
        address: '123 Main Street, Downtown'
      },
      {
        name: 'TechMart Electronics',
        email: 'info@techmart.com',
        address: '456 Tech Avenue, Electronics District'
      },
      {
        name: 'Fashion Fusion',
        email: 'hello@fashionfusion.com',
        address: '789 Style Boulevard, Shopping Center'
      },
      {
        name: 'Green Grocery',
        email: 'orders@greengrocery.com',
        address: '321 Fresh Lane, Market Square'
      },
      {
        name: 'Coffee Corner',
        email: 'info@coffeecorner.com',
        address: '654 Brew Street, Arts District'
      },
      {
        name: 'Book Haven',
        email: 'contact@bookhaven.com',
        address: '987 Reading Road, University Area'
      }
    ];

    for (const store of stores) {
      // Check if store already exists
      const [existing] = await pool.execute(
        'SELECT id FROM stores WHERE name = ?',
        [store.name]
      );

      if (existing.length === 0) {
        await pool.execute(
          'INSERT INTO stores (name, email, address) VALUES (?, ?, ?)',
          [store.name, store.email, store.address]
        );
        console.log(`✓ Created store: ${store.name}`);
      } else {
        console.log(`- Store already exists: ${store.name}`);
      }
    }

    console.log('\n🎉 Sample stores created successfully!');
    console.log('You can now rate these stores in your dashboard.');
    
  } catch (error) {
    console.error('Error creating sample stores:', error);
  } finally {
    await pool.end();
  }
};

createSampleStores();
