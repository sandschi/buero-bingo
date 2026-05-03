import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { entryId, userId, type } = await request.json(); // type: 'up' | 'down'
    
    // Check if user already voted
    const existingVote = await query('SELECT id FROM votes WHERE entry_id = $1 AND user_id = $2', [entryId, userId]);
    
    if (existingVote.rows.length > 0) {
      return NextResponse.json({ error: 'Already voted' }, { status: 400 });
    }

    // Insert vote
    await query('INSERT INTO votes (entry_id, user_id, type) VALUES ($1, $2, $3)', [entryId, userId, type]);

    // Update vote count or check threshold
    const { rows: voteCountRows } = await query(`
      SELECT 
        SUM(CASE WHEN type = 'up' THEN 1 ELSE 0 END) - 
        SUM(CASE WHEN type = 'down' THEN 1 ELSE 0 END) as score 
      FROM votes WHERE entry_id = $1
    `, [entryId]);
    const score = parseInt(voteCountRows[0].score) || 0;

    // Fetch threshold from settings
    const { rows: settingsRows } = await query("SELECT value FROM settings WHERE key = 'auto_approve_threshold'");
    const threshold = settingsRows.length > 0 ? parseInt(settingsRows[0].value) : 5;

    // Auto-approval logic
    if (score >= threshold) {
      await query('UPDATE bingo_entries SET status = $1 WHERE id = $2', ['approved', entryId]);
    }

    return NextResponse.json({ success: true, score });
  } catch (error) {
    console.error('Failed to vote:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
