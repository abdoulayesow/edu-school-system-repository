#!/usr/bin/env node

/**
 * Database Migration Script
 * Runs the SQL schema from src/database/schema.sql
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'friasoft_user',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'friasoft_dev',
});

async function runMigrations() {
  const client = await pool.connect();

  try {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║     Database Migration Script              ║');
    console.log('║     Friasoft School Management System      ║');
    console.log('╚════════════════════════════════════════════╝\n');

    console.log('📊 Connecting to database...');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Database: ${process.env.DB_NAME || 'friasoft_dev'}`);
    console.log(`   User: ${process.env.DB_USER || 'friasoft_user'}\n`);

    // Read schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Run migrations
    console.log('🔄 Running schema migrations...\n');

    // Split by semicolon and filter empty statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    let tableCount = 0;
    let indexCount = 0;

    for (const statement of statements) {
      try {
        await client.query(statement + ';');

        // Count what was created
        if (statement.toUpperCase().includes('CREATE TABLE')) {
          tableCount++;
          const tableName = statement.match(/CREATE TABLE (\w+)/i)?.[1];
          console.log(`  ✅ Created table: ${tableName}`);
        } else if (statement.toUpperCase().includes('CREATE INDEX')) {
          indexCount++;
        }
      } catch (error) {
        // Index or constraint might already exist, that's OK
        if (error.code === '42P07' || error.code === '42710') {
          // Already exists - this is fine during migrations
          continue;
        }
        throw error;
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`  • Tables created: ${tableCount}`);
    console.log(`  • Indexes created: ${indexCount}`);

    // Verify tables exist
    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    const result = await client.query(tablesQuery);
    const tables = result.rows.map(row => row.table_name);

    console.log(`\n📋 Database Tables (${tables.length} total):`);
    tables.forEach(table => {
      console.log(`  • ${table}`);
    });

    // Expected tables
    const expectedTables = [
      'schools',
      'users',
      'students',
      'classes',
      'class_students',
      'subjects',
      'grades',
      'timetable',
      'invoices',
      'payments',
      'notifications',
      'announcements',
      'sync_log',
    ];

    const missingTables = expectedTables.filter(t => !tables.includes(t));

    if (missingTables.length === 0) {
      console.log(`\n✅ All expected tables created successfully!\n`);
    } else {
      console.log(`\n⚠️  Missing tables: ${missingTables.join(', ')}\n`);
    }

    console.log('🚀 Database migration complete!\n');
    console.log('Next steps:');
    console.log('  1. npm run dev         (start backend server)');
    console.log('  2. curl http://localhost:5000/api/health   (test API)\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Verify PostgreSQL is running');
    console.error('  2. Check database credentials in .env file');
    console.error('  3. Ensure the database user has permissions');
    console.error('  4. Run: npm run db:migrate again\n');

    process.exit(1);
  } finally {
    await client.release();
    await pool.end();
  }
}

runMigrations();
