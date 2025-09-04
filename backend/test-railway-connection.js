const mysql = require('mysql2');
require('dotenv').config();

async function testRailwayConnection() {
  try {
    console.log('🔍 Testing Railway database connection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    
    // Create connection with Railway credentials
    const connection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Test connection
    await connection.promise().execute('SELECT 1 as test');
    console.log('✅ Railway MySQL connection successful');

    // Show existing tables
    const [tables] = await connection.promise().execute('SHOW TABLES');
    console.log('\n📋 Existing tables:');
    if (tables.length === 0) {
      console.log('   No tables found - database is empty');
    } else {
      tables.forEach(table => {
        console.log(`   - ${Object.values(table)[0]}`);
      });
    }

    connection.end();
    console.log('\n✅ Connection test complete!');
    
  } catch (error) {
    console.error('❌ Railway connection error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    
    if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Suggestion: Check if DB_HOST is correct in your .env file');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Suggestion: Check DB_USER and DB_PASSWORD in your .env file');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n💡 Suggestion: Railway might require SSL or different connection settings');
    }
  }
}

testRailwayConnection();
