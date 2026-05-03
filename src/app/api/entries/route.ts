import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

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

export async function GET() {
  try {
    // For voting page: get pending entries
    const { rows } = await query('SELECT * FROM bingo_entries WHERE status = $1 ORDER BY created_at DESC', ['pending']);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch entries:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
