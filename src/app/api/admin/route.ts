import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  const { password, action, entryId, status, settingsKey, settingsValue, departmentName, departmentId, editText, editDepartmentIds } = await request.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (action === 'update_status') {
      await query('UPDATE bingo_entries SET status = $1 WHERE id = $2', [status, entryId]);

    } else if (action === 'update_entry') {
      await query(
        'UPDATE bingo_entries SET text = $1, department_ids = $2 WHERE id = $3',
        [editText, editDepartmentIds, entryId]
      );

    } else if (action === 'delete') {
      await query('DELETE FROM bingo_entries WHERE id = $1', [entryId]);

    } else if (action === 'get_all') {
      const { rows: entries } = await query(`
        SELECT e.*,
               COALESCE(SUM(CASE WHEN v.type = 'down' THEN 1 ELSE 0 END), 0)::int as downvotes
        FROM bingo_entries e
        LEFT JOIN votes v ON e.id = v.entry_id
        GROUP BY e.id
        ORDER BY e.created_at DESC
      `);

      const { rows: deptVoteRows } = await query(`
        SELECT v.entry_id, d.id as dept_id, d.name as dept_name, COUNT(*)::int as count
        FROM votes v
        JOIN departments d ON v.department_id = d.id
        WHERE v.type = 'dept'
        GROUP BY v.entry_id, d.id, d.name
      `);

      const deptVoteMap: Record<string, { dept_id: string; dept_name: string; count: number }[]> = {};
      for (const r of deptVoteRows) {
        if (!deptVoteMap[r.entry_id]) deptVoteMap[r.entry_id] = [];
        deptVoteMap[r.entry_id].push({ dept_id: r.dept_id, dept_name: r.dept_name, count: r.count });
      }

      return NextResponse.json(entries.map((e: any) => ({ ...e, dept_vote_counts: deptVoteMap[e.id] || [] })));

    } else if (action === 'get_settings') {
      const { rows } = await query('SELECT key, value FROM settings');
      return NextResponse.json(rows);

    } else if (action === 'update_settings') {
      await query(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
        [settingsKey, JSON.stringify(settingsValue)]
      );

    } else if (action === 'get_departments') {
      const { rows } = await query('SELECT * FROM departments ORDER BY name ASC');
      return NextResponse.json(rows);

    } else if (action === 'add_department') {
      await query('INSERT INTO departments (name) VALUES ($1)', [departmentName]);

    } else if (action === 'delete_department') {
      await query('DELETE FROM departments WHERE id = $1', [departmentId]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
