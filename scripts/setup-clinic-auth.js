#!/usr/bin/env node

/**
 * Database Migration Script for Clinic Authentication
 * 
 * Usage:
 *   node scripts/setup-clinic-auth.js
 * 
 * Environment Variables Required:
 *   DATABASE_URL - PostgreSQL connection string
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupClinicAuth() {
  console.log('🔐 Setting up Clinic Authentication Database...\n');

  // Check for DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ Error: DATABASE_URL environment variable not set');
    console.log('\nPlease set DATABASE_URL in your .env.local file:');
    console.log('DATABASE_URL=postgresql://user:password@localhost:5432/paintracker\n');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  });

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');

    // Read SQL schema
    console.log('📄 Reading authentication schema...');
    const schemaPath = path.join(__dirname, '..', 'database', 'clinic-auth-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('✅ Schema loaded\n');

    // Execute schema
    console.log('🔨 Creating database tables and functions...');
    await pool.query(schema);
    console.log('✅ Database schema created successfully\n');

    // Verify tables
    console.log('🔍 Verifying tables...');
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN (
          'clinicians',
          'clinician_sessions',
          'clinician_permissions',
          'clinician_audit_log',
          'patient_clinician_assignments'
        )
      ORDER BY table_name
    `);

    const expectedTables = [
      'clinicians',
      'clinician_sessions',
      'clinician_permissions',
      'clinician_audit_log',
      'patient_clinician_assignments'
    ];

    const createdTables = result.rows.map(row => row.table_name);
    const missingTables = expectedTables.filter(t => !createdTables.includes(t));

    if (missingTables.length > 0) {
      console.log('⚠️  Warning: Some tables were not created:');
      missingTables.forEach(table => console.log(`   - ${table}`));
      console.log('');
    } else {
      console.log('✅ All tables created successfully:');
      createdTables.forEach(table => console.log(`   ✓ ${table}`));
      console.log('');
    }

    // Check for sample data
    console.log('👥 Checking for sample clinician accounts...');
    const clinicians = await pool.query('SELECT email, name, role FROM clinicians');
    
    if (clinicians.rows.length > 0) {
      console.log('✅ Sample accounts created:');
      clinicians.rows.forEach(c => {
        console.log(`   ✓ ${c.name} (${c.email}) - ${c.role}`);
      });
      console.log('\n💡 Default password for all sample accounts: password123');
    } else {
      console.log('⚠️  No sample accounts found');
    }

    console.log('\n🎉 Setup complete!\n');
    console.log('Next steps:');
    console.log('1. Update your .env.local with JWT secrets:');
    console.log('   JWT_SECRET=your-super-secret-key');
    console.log('   JWT_REFRESH_SECRET=your-refresh-secret-key\n');
    console.log('2. Start your development server:');
    console.log('   npm run dev\n');
    console.log('3. Navigate to http://localhost:3000/clinic\n');
    console.log('4. Log in with:');
    console.log('   Email: doctor@clinic.com');
    console.log('   Password: password123\n');

  } catch (error) {
    console.error('❌ Error during setup:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Tip: Make sure PostgreSQL is running:');
      console.log('   Windows: Check Services or start PostgreSQL');
      console.log('   Mac: brew services start postgresql');
      console.log('   Linux: sudo systemctl start postgresql\n');
    } else if (error.code === '42P07') {
      console.log('\n💡 Tables already exist. To recreate:');
      console.log('   1. Drop existing tables (WARNING: deletes data)');
      console.log('   2. Run this script again\n');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run setup
setupClinicAuth().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
