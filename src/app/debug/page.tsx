import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function DebugPage() {
  try {
    const client = await pool.connect();
    try {
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      const extensionsResult = await client.query(`
        SELECT extname FROM pg_extension
      `);

      return (
        <div className="p-8 font-mono">
          <h1 className="text-2xl mb-4">Database Debug Info</h1>
          <section className="mb-6">
            <h2 className="text-xl font-bold">Tables:</h2>
            <ul className="list-disc pl-5">
              {tablesResult.rows.map(row => (
                <li key={row.table_name}>{row.table_name}</li>
              ))}
              {tablesResult.rows.length === 0 && <li>No tables found</li>}
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold">Extensions:</h2>
            <ul className="list-disc pl-5">
              {extensionsResult.rows.map(row => (
                <li key={row.extname}>{row.extname}</li>
              ))}
            </ul>
          </section>
        </div>
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    return (
      <div className="p-8 font-mono text-red-500">
        <h1 className="text-2xl mb-4">Database Error</h1>
        <pre>{error.message}</pre>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }
}
