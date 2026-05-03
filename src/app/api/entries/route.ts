import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: return all pending entries with per-dept vote counts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  try {
    const { rows: entries } = await query(
      'SELECT * FROM bingo_entries WHERE status = $1 ORDER BY created_at DESC',
      ['pending']
    );

    // Per-entry, per-dept vote counts
    const { rows: deptVotes } = await query(
      "SELECT entry_id, department_id, COUNT(*) as count FROM votes WHERE type = 'dept' GROUP BY entry_id, department_id"
    );

    // Per-entry downvote counts
    const { rows: downVotes } = await query(
      "SELECT entry_id, COUNT(*) as count FROM votes WHERE type = 'down' GROUP BY entry_id"
    );

    // User's votes (only query if userId looks like a valid UUID)
    let userVotes: { entry_id: string; department_id: string | null; type: string }[] = [];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (userId && uuidRegex.test(userId)) {
      try {
        const { rows } = await query(
          'SELECT entry_id, department_id, type FROM votes WHERE user_id = $1',
          [userId]
        );
        userVotes = rows;
      } catch {
        // Invalid userId format — skip user vote state
      }
    }

    // Build vote maps
    const deptVoteMap: Record<string, Record<string, number>> = {};
    for (const r of deptVotes) {
      if (!deptVoteMap[r.entry_id]) deptVoteMap[r.entry_id] = {};
      deptVoteMap[r.entry_id][r.department_id] = parseInt(r.count);
    }
    const downVoteMap: Record<string, number> = {};
    for (const r of downVotes) downVoteMap[r.entry_id] = parseInt(r.count);

    const userDeptVotes: Record<string, string[]> = {};
    const userDownVotes = new Set<string>();
    for (const v of userVotes) {
      if (v.type === 'dept' && v.department_id) {
        if (!userDeptVotes[v.entry_id]) userDeptVotes[v.entry_id] = [];
        userDeptVotes[v.entry_id].push(v.department_id);
      } else if (v.type === 'down') {
        userDownVotes.add(v.entry_id);
      }
    }

    const result = entries.map(e => ({
      ...e,
      deptVotes: deptVoteMap[e.id] || {},
      downvotes: downVoteMap[e.id] || 0,
      userDeptVotes: userDeptVotes[e.id] || [],
      userDownvoted: userDownVotes.has(e.id),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch entries:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { text, departmentIds, authorName } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const { rows } = await query(
      'INSERT INTO bingo_entries (text, department_ids, author_name, status) VALUES ($1, $2, $3, $4) RETURNING id',
      [text, departmentIds || [], authorName || 'Anonym', 'pending']
    );

    return NextResponse.json({ success: true, id: rows[0].id });
  } catch (error) {
    console.error('Failed to create entry:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
