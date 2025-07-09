import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import sql from '@/lib/db';
import { listImagesFromFolder } from '@/lib/googleDrive';
// 自動標籤僅在上傳時處理，匯入流程不再呼叫 Vision

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.accessToken) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const folderId = process.env.DRIVE_FOLDER_ID;
  if (!folderId) {
    return new NextResponse('Missing DRIVE_FOLDER_ID env', { status: 500 });
  }

  // list images from Drive folder
  const files = await listImagesFromFolder(String(token.accessToken), folderId, (token as any).refreshToken as string | undefined);

  let imported = 0;

  for (const f of files) {
    try {
      const exists = await sql`SELECT 1 FROM photos WHERE file_id = ${f.id}`;
      if (exists.length) continue;

      const imageUrl = `https://drive.google.com/uc?export=download&id=${f.id}`;
      // 匯入流程暫不產生標籤

      const [photo] = await sql`
        INSERT INTO photos (file_id, name, image_url)
        VALUES (${f.id}, ${f.name}, ${imageUrl})
        RETURNING id;
      `;
      const photoId = photo.id as number;

      // 匯入流程暫不產生標籤
      imported++;
    } catch (e) {
      console.error(e);
    }
  }

  return NextResponse.json({ imported });
} 