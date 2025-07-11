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

  try {
    // 使用新的 listImagesFromFolder 函數，會自動處理 Token 刷新
    const { files, tokens } = await listImagesFromFolder(
      String(token.accessToken), 
      folderId, 
      (token as any).refreshToken as string | undefined
    );

    let imported = 0;

    for (const f of files) {
      try {
        const exists = await sql`SELECT 1 FROM photos WHERE file_id = ${f.id}`;
        if (exists.length) continue;

        const imageUrl = `https://drive.google.com/uc?export=download&id=${f.id}`;

        const [photo] = await sql`
          INSERT INTO photos (file_id, name, image_url)
          VALUES (${f.id}, ${f.name}, ${imageUrl})
          RETURNING id;
        `;

        imported++;
      } catch (e) {
        console.error('匯入照片失敗:', e);
      }
    }

    const response = NextResponse.json({ 
      imported, 
      total: files.length,
      success: true,
      message: `成功匯入 ${imported} 張照片`
    });

    // 如果 Token 有更新，設定標頭
    if (tokens.accessToken !== token.accessToken) {
      console.log('Token 已刷新，更新 Session');
      response.headers.set('X-Token-Refreshed', 'true');
    }

    return response;

  } catch (error: any) {
    console.error('匯入失敗:', error);
    
    // 如果是授權相關錯誤
    if (error.message?.includes('無法刷新 Access Token')) {
      return new NextResponse('Token 過期，請重新登入', { status: 401 });
    }
    
    return new NextResponse(`匯入失敗: ${error.message}`, { status: 500 });
  }
} 