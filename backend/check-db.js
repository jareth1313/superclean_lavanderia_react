#!/usr/bin/env node
/**
 * Script de diagnóstico para verificar la conexión a MySQL
 * Uso: node check-db.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkDatabase() {
  console.log('🔍 Checking database connection...\n');
  
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };

  console.log('📋 Configuration:');
  console.log(`  Host: ${config.host}`);
  console.log(`  User: ${config.user}`);
  console.log(`  Database: ${config.database}`);
  console.log(`  Password: ${config.password ? '***' : 'empty'}\n`);

  try {
    console.log('🔗 Attempting connection...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Connection successful!\n');

    // Get all tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('📦 Available tables:');
    const tableNames = tables.map(t => Object.values(t)[0]);
    tableNames.forEach(t => console.log(`  - ${t}`));
    
    // Check possible prenda table names
    const possibleNames = ['prenda', 'prendas', 'tipo_prenda', 'tipos_prenda', 'productos'];
    let prendasTable = null;
    
    for (const name of possibleNames) {
      if (tableNames.includes(name)) {
        prendasTable = name;
        break;
      }
    }

    if (prendasTable) {
      console.log(`\n✅ Found table: "${prendasTable}"`);
      
      // Check structure
      console.log(`\n🔍 Checking ${prendasTable} table structure...`);
      try {
        const [structure] = await connection.query(`DESCRIBE ${prendasTable}`);
        console.log(`✅ Table structure:`);
        console.table(structure.map(col => ({
          Field: col.Field,
          Type: col.Type,
          Null: col.Null,
          Key: col.Key,
          Default: col.Default,
          Extra: col.Extra
        })));
        
        // Check row count
        const [countResult] = await connection.query(`SELECT COUNT(*) as count FROM ${prendasTable}`);
        const count = countResult[0]?.count || 0;
        console.log(`\n📊 Current records: ${count}`);
      } catch (err) {
        console.error(`❌ Error reading ${prendasTable}:`, err.message);
      }
    } else {
      console.log('\n❌ No prenda/prendas table found');
      console.log('\n💡 Create the table with:');
      console.log(`
CREATE TABLE prenda (
  pk_prenda INT AUTO_INCREMENT PRIMARY KEY,
  nom_prenda VARCHAR(100) NOT NULL,
  descripcion_prenda VARCHAR(255),
  precio_prenda DECIMAL(10,2) NOT NULL,
  estatus_prenda TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
      `);
    }

    // Test insert if table exists
    if (prendasTable) {
      console.log(`\n🧪 Testing INSERT into ${prendasTable}...`);
      try {
        const testData = {
          nombre: 'Test_Prenda_' + Date.now(),
          descripcion: 'Prenda de prueba',
          precio: 99.99
        };
        
        const query = `
          INSERT INTO ${prendasTable} (nom_prenda, descripcion_prenda, precio_prenda, estatus_prenda) 
          VALUES (?, ?, ?, 1)
        `;
        
        await connection.query(query, [
          testData.nombre, 
          testData.descripcion, 
          testData.precio
        ]);
        console.log('✅ INSERT successful!');
        
        // Clean up test data
        await connection.query(
          `DELETE FROM ${prendasTable} WHERE nom_prenda = ?`,
          [testData.nombre]
        );
        console.log('🧹 Test data cleaned up');
      } catch (err) {
        console.error('❌ INSERT failed:', err.message);
        console.error('Error code:', err.code);
        if (err.sql) console.error('SQL:', err.sql);
      }
    }

    await connection.end();
    console.log('\n✅ All tests completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'ER_ACCESS_DENIED_FOR_USER') {
      console.error('\n💡 Possible solutions:');
      console.error('  1. Check DB_USER and DB_PASSWORD in .env');
      console.error('  2. Verify MySQL is running');
      console.error('  3. Verify the user has permissions on the database');
      console.error('  4. Try: mysql -u root -pmysql');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Database does not exist');
      console.error(`  Create it: CREATE DATABASE ${config.database};`);
    }
    
    process.exit(1);
  }
}

checkDatabase();

