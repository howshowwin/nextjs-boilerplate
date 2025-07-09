import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest) {
  const idStr = req.nextUrl.pathname.split('/').pop() || '';
  const id = Number(idStr);
  if (Number.isNaN(id)) {
    return new NextResponse('Invalid ID', { status: 400 });
  }

  await sql`DELETE FROM photos WHERE id = ${id};`;
  return new NextResponse(null, { status: 204 });
} 