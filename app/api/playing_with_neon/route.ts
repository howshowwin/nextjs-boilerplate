import sql from '@/lib/db';
import { NextResponse } from 'next/server';

// 如有需要可設為動態，避免快取
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM playing_with_neon ORDER BY id`;
    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 