import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deptId = searchParams.get('deptId');

  try {
    // Get entries that are approved AND (either for all departments {} OR match the deptId)
    let sql = 'SELECT * FROM bingo_entries WHERE status = $1';
    let params = ['approved'];

    if (deptId) {
      sql += ' AND (department_ids = $2 OR $3 = ANY(department_ids))';
      params.push('{}', deptId);
    } else {
      sql += ' AND department_ids = $2';
      params.push('{}');
    }

    const { rows } = await query(sql, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch play entries:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
