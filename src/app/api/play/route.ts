import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deptId = searchParams.get('deptId');

  try {
    // Get approved entries that include the requested department in their department_ids
    let sql: string;
    let params: string[];

    if (deptId) {
      sql = "SELECT * FROM bingo_entries WHERE status = 'approved' AND $1::uuid = ANY(department_ids)";
      params = [deptId];
    } else {
      sql = "SELECT * FROM bingo_entries WHERE status = 'approved'";
      params = [];
    }

    const { rows } = await query(sql, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch play entries:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
