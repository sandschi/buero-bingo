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
    await query('INSERT INTO votes (entry_id, user_id) VALUES ($1, $2)', [entryId, userId]);

    // Update vote count or check threshold (simplified for now: just count rows)
    const { rows: voteCountRows } = await query('SELECT COUNT(*) as count FROM votes WHERE entry_id = $1', [entryId]);
    const votes = parseInt(voteCountRows[0].count);

    // Auto-approval logic (e.g., threshold of 5 for testing)
    const threshold = 5; 
    if (votes >= threshold) {
      await query('UPDATE bingo_entries SET status = $1, is_approved = $2 WHERE id = $3', ['approved', true, entryId]);
    }

    return NextResponse.json({ success: true, votes });
  } catch (error) {
    console.error('Failed to vote:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
