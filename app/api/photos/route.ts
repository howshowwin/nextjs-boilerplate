import sql from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // 確保資料表存在
  await sql`
    CREATE TABLE IF NOT EXISTS photos (
      id SERIAL PRIMARY KEY,
      file_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      image_url TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS photo_labels (
      id SERIAL PRIMARY KEY,
      photo_id INTEGER REFERENCES photos(id) ON DELETE CASCADE,
      label TEXT
    );
  `;

  const rows = await sql`
    SELECT p.*, array_agg(pl.label) AS labels
    FROM photos p
    LEFT JOIN photo_labels pl ON pl.photo_id = p.id
    GROUP BY p.id
    ORDER BY p.id DESC;
  `;

  return NextResponse.json(rows);
} 