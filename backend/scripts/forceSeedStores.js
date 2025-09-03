const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

const SAMPLE_STORES = [
  { id:1, name: 'Pizza Paradise', email: 'contact@pizzaparadise.com', address: '123 Main Street, Downtown', description: 'Artisan pizzas with fresh ingredients and wood-fired flavor.', category: 'restaurant', phone: '(555) 111-1111', website: 'https://pizzaparadise.example.com' },
  { id:2, name: 'TechMart Electronics', email: 'info@techmart.com', address: '456 Tech Avenue, Electronics District', description: 'Latest gadgets, computers, and accessories with expert support.', category: 'electronics', phone: '(555) 222-2222', website: 'https://techmart.example.com' },
  { id:3, name: 'Fashion Fusion', email: 'hello@fashionfusion.com', address: '789 Style Boulevard, Shopping Center', description: 'Trendy apparel and accessories for all styles and seasons.', category: 'clothing', phone: '(555) 333-3333', website: 'https://fashionfusion.example.com' },
  { id:4, name: 'Green Grocery', email: 'orders@greengrocery.com', address: '321 Fresh Lane, Market Square', description: 'Organic produce and locally sourced fresh groceries.', category: 'grocery', phone: '(555) 444-4444', website: 'https://greengrocery.example.com' },
  { id:5, name: 'Coffee Corner', email: 'info@coffeecorner.com', address: '654 Brew Street, Arts District', description: 'Specialty coffee, pastries, and a cozy atmosphere.', category: 'cafe', phone: '(555) 555-5555', website: 'https://coffeecorner.example.com' },
  { id:6, name: 'Book Haven', email: 'contact@bookhaven.com', address: '987 Reading Road, University Area', description: 'Independent bookstore with curated titles and reading events.', category: 'bookstore', phone: '(555) 666-6666', website: 'https://bookhaven.example.com' }
];

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  try {
    console.log('Force seeding/enriching sample stores...');
    for (const s of SAMPLE_STORES) {
      await conn.execute(
        `INSERT INTO stores (name, email, address, description, category, phone, website, owner_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NOW(), NOW())
         ON DUPLICATE KEY UPDATE 
           name=VALUES(name),
           address=VALUES(address),
           description=COALESCE(stores.description, VALUES(description)),
           category=COALESCE(stores.category, VALUES(category)),
           phone=COALESCE(stores.phone, VALUES(phone)),
           website=COALESCE(stores.website, VALUES(website)),
           updated_at=NOW()`,
        [s.name, s.email, s.address, s.description, s.category, s.phone, s.website]
      );
      console.log(`✔ ensured store: ${s.name}`);
    }

    // Add a few example ratings from admin (user id 1) if none exist
    const [ratingCountRows] = await conn.execute('SELECT COUNT(*) AS c FROM ratings');
    if (ratingCountRows[0].c === 0) {
      console.log('No ratings found, inserting sample ratings...');
      const ratings = [
        { email: 'contact@pizzaparadise.com', rating: 5 },
        { email: 'info@techmart.com', rating: 4 },
        { email: 'hello@fashionfusion.com', rating: 3 },
        { email: 'orders@greengrocery.com', rating: 5 },
        { email: 'info@coffeecorner.com', rating: 4 },
        { email: 'contact@bookhaven.com', rating: 5 }
      ];
      for (const r of ratings) {
        const [[store]] = await conn.execute('SELECT id FROM stores WHERE email = ?', [r.email]);
        if (store) {
          await conn.execute(
            `INSERT IGNORE INTO ratings (user_id, store_id, rating, created_at, updated_at)
             VALUES (1, ?, ?, NOW(), NOW())`,
            [store.id, r.rating]
          );
        }
      }
      console.log('Sample ratings inserted.');
    } else {
      console.log('Ratings already exist, skipping sample ratings.');
    }

    console.log('\nDone.');
  } catch (e) {
    console.error('Error force seeding stores:', e.message);
  } finally {
    await conn.end();
  }
}

run();
