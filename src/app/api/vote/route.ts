import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { entryId, userId, type, departmentId } = await request.json();

    if (type === 'dept') {
      if (!departmentId) {
        return NextResponse.json({ error: 'departmentId required for dept votes' }, { status: 400 });
      }

      // Cannot dept-vote if already downvoted
      const downvoteCheck = await query(
        "SELECT id FROM votes WHERE entry_id = $1 AND user_id = $2 AND type = 'down'",
        [entryId, userId]
      );
      if (downvoteCheck.rows.length > 0) {
        return NextResponse.json({ error: 'Cannot dept-vote after downvoting' }, { status: 400 });
      }

      // Check if already voted this dept (return current count, idempotent)
      const existing = await query(
        "SELECT id FROM votes WHERE entry_id = $1 AND user_id = $2 AND department_id = $3 AND type = 'dept'",
        [entryId, userId, departmentId]
      );
      if (existing.rows.length > 0) {
        return NextResponse.json({ error: 'Already voted for this department' }, { status: 400 });
      }

      await query(
        "INSERT INTO votes (entry_id, user_id, type, department_id) VALUES ($1, $2, 'dept', $3)",
        [entryId, userId, departmentId]
      );

      // Auto-approve if threshold reached for this department
      const { rows: countRows } = await query(
        "SELECT COUNT(*) as count FROM votes WHERE entry_id = $1 AND department_id = $2 AND type = 'dept'",
        [entryId, departmentId]
      );
      const count = parseInt(countRows[0].count);
      const { rows: settingsRows } = await query("SELECT value FROM settings WHERE key = 'auto_approve_threshold'");
      const threshold = settingsRows.length > 0 ? parseInt(settingsRows[0].value) : 5;

      if (count >= threshold) {
        await query(
          `UPDATE bingo_entries
           SET department_ids = array_append(department_ids, $1::uuid),
               status = 'approved'
           WHERE id = $2 AND NOT ($1::uuid = ANY(department_ids))`,
          [departmentId, entryId]
        );
      }

      return NextResponse.json({ success: true, count });

    } else if (type === 'down') {
      // Cannot downvote if already has dept votes
      const deptVoteCheck = await query(
        "SELECT id FROM votes WHERE entry_id = $1 AND user_id = $2 AND type = 'dept' LIMIT 1",
        [entryId, userId]
      );
      if (deptVoteCheck.rows.length > 0) {
        return NextResponse.json({ error: 'Cannot downvote after dept-voting' }, { status: 400 });
      }

      const existing = await query(
        "SELECT id FROM votes WHERE entry_id = $1 AND user_id = $2 AND type = 'down'",
        [entryId, userId]
      );
      if (existing.rows.length > 0) {
        return NextResponse.json({ error: 'Already downvoted' }, { status: 400 });
      }

      await query(
        "INSERT INTO votes (entry_id, user_id, type) VALUES ($1, $2, 'down')",
        [entryId, userId]
      );

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Failed to vote:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE handler: remove a specific vote (undo)
export async function DELETE(request: Request) {
  try {
    const { entryId, userId, type, departmentId } = await request.json();

    if (type === 'dept' && departmentId) {
      await query(
        "DELETE FROM votes WHERE entry_id = $1 AND user_id = $2 AND department_id = $3 AND type = 'dept'",
        [entryId, userId, departmentId]
      );
    } else if (type === 'down') {
      await query(
        "DELETE FROM votes WHERE entry_id = $1 AND user_id = $2 AND type = 'down'",
        [entryId, userId]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove vote:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
