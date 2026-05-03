import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const initDb = async () => {
  console.log('Initializing database...');
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS departments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS bingo_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        text TEXT NOT NULL,
        department_ids UUID[] DEFAULT '{}',
        author_name TEXT DEFAULT 'Anonym',
        status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS votes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entry_id UUID REFERENCES bingo_entries(id) ON DELETE CASCADE,
        user_id UUID NOT NULL,
        type TEXT NOT NULL, -- 'up', 'down'
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(entry_id, user_id)
      );
    `);
    
    // Seed default departments if none exist
    const { rowCount } = await query('SELECT 1 FROM departments LIMIT 1');
    if (rowCount === 0) {
      await query(`
        INSERT INTO departments (name) VALUES 
        ('IT'), ('Sales'), ('HR'), ('Marketing'), ('Management'), ('Allgemein');
      `);
    }
    
    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
};
