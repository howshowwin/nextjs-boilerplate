import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { listImagesWithPagination } from '@/lib/googleDrive';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.accessToken) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const folderId = process.env.DRIVE_FOLDER_ID;
  if (!folderId) {
    return new NextResponse('Missing DRIVE_FOLDER_ID', { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const pageToken = searchParams.get('pageToken') ?? undefined;

  try {
    // 使用新的 listImagesWithPagination 函數，會自動處理 Token 刷新
    const { files, nextPageToken, tokens } = await listImagesWithPagination(
      String(token.accessToken),
      folderId,
      pageToken,
      (token as any).refreshToken as string | undefined
    );

    const items = files.map((f) => {
      const id = f.id ?? '';
      return {
        id,
        name: f.name ?? '',
        url: `https://lh3.googleusercontent.com/d/${id}=w600-h600`, // grid preview
        full: `https://lh3.googleusercontent.com/d/${id}=w2400`, // lightbox full size
      };
    });

    const response = NextResponse.json({ 
      items, 
      nextPageToken: nextPageToken ?? null,
      success: true
    });

    // 如果 Token 有更新，設定標頭
    if (tokens.accessToken !== token.accessToken) {
      console.log('Token 已刷新，更新 Session');
      response.headers.set('X-Token-Refreshed', 'true');
    }

    return response;

  } catch (error: any) {
    console.error('取得 Drive 圖片失敗:', error);
    
    // 如果是授權相關錯誤
    if (error.message?.includes('無法刷新 Access Token')) {
      return new NextResponse('Token 過期，請重新登入', { status: 401 });
    }
    
    return new NextResponse(`取得圖片失敗: ${error.message}`, { status: 500 });
  }
} 