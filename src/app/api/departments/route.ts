import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await query('SELECT id, name FROM departments ORDER BY name ASC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch departments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
