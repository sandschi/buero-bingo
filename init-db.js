const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function init() {
  console.log('Initializing database...');
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;

      CREATE TABLE IF NOT EXISTS departments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS bingo_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        text TEXT NOT NULL,
        department_ids UUID[] DEFAULT '{}',
        author_name TEXT DEFAULT 'Anonym',
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS votes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entry_id UUID REFERENCES bingo_entries(id) ON DELETE CASCADE,
        user_id UUID NOT NULL,
        type TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(entry_id, user_id)
      );
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL
      );
    `);
    
    // Seed default settings
    const settingsRes = await client.query("SELECT 1 FROM settings WHERE key = 'auto_approve_threshold'");
    if (settingsRes.rowCount === 0) {
      await client.query("INSERT INTO settings (key, value) VALUES ('auto_approve_threshold', '5')");
    }
    const res = await client.query('SELECT 1 FROM departments LIMIT 1');
    if (res.rowCount === 0) {
      await client.query(`
        INSERT INTO departments (name) VALUES 
        ('IT'), ('Sales'), ('HR'), ('Marketing'), ('Management'), ('Allgemein');
      `);
      console.log('Seeded default departments.');
    }
    
    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

init().then(() => {
  console.log('Script execution finished.');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error during initialization:', err);
  process.exit(1);
});
