import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  const { password, action, entryId, status, settingsKey, settingsValue } = await request.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (action === 'update_status') {
      await query('UPDATE bingo_entries SET status = $1 WHERE id = $2', [status, entryId]);
    } else if (action === 'delete') {
      await query('DELETE FROM bingo_entries WHERE id = $1', [entryId]);
    } else if (action === 'get_all') {
      const { rows } = await query('SELECT * FROM bingo_entries ORDER BY created_at DESC');
      return NextResponse.json(rows);
    } else if (action === 'get_settings') {
      const { rows } = await query('SELECT key, value FROM settings');
      return NextResponse.json(rows);
    } else if (action === 'update_settings') {
      await query('INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value', [settingsKey, JSON.stringify(settingsValue)]);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
