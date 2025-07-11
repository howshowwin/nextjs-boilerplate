import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { uploadImageToFolder } from '@/lib/googleDrive';
import sql from '@/lib/db';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.accessToken) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const description = (formData.get('description') as string) ?? '';
    const base64Data = (formData.get('base64') as string) ?? '';
    
    if (!file) {
      return new NextResponse('No file', { status: 400 });
    }

    const ext = file.name.split('.').pop() ?? 'jpg';
    const uniqueName = `${Date.now()}-${randomUUID()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const folderId = process.env.DRIVE_FOLDER_ID!;
    
    // 使用新的 uploadImageToFolder 函數，會自動處理 Token 刷新
    const { file: uploaded, tokens } = await uploadImageToFolder(
      String(token.accessToken),
      folderId,
      uniqueName,
      file.type,
      buffer,
      (token as any).refreshToken as string | undefined,
    );

    const imageUrl = `https://drive.google.com/uc?export=download&id=${uploaded.id}`;

    // 確保資料表欄位存在
    await sql`ALTER TABLE photos ADD COLUMN IF NOT EXISTS description TEXT;`;
    await sql`ALTER TABLE photos ADD COLUMN IF NOT EXISTS unique_name TEXT;`;

    // 如果有 base64 數據，使用 Gemini 產生標籤
    let labels: string[] = [];
    if (base64Data) {
      try {
        const clean = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
        labels = await (await import('@/lib/gemini')).geminiLabels(clean);
      } catch (error) {
        console.error('Gemini 標籤產生失敗:', error);
        // 繼續執行，不因為標籤失敗而中斷上傳
      }
    }

    // 儲存照片到資料庫
    const [photo] = await sql`
      INSERT INTO photos (file_id, name, unique_name, description, image_url)
      VALUES (${uploaded.id}, ${uploaded.name}, ${uniqueName}, ${description}, ${imageUrl})
      ON CONFLICT (file_id) DO NOTHING
      RETURNING id;
    `;

    // 儲存標籤
    if (photo?.id) {
      for (const label of labels) {
        await sql`INSERT INTO photo_labels (photo_id, label) VALUES (${photo.id}, ${label});`;
      }
    }

    // 回傳成功結果，包含新的 Token 資訊（如果有刷新的話）
    const response = NextResponse.json({ 
      uploadedId: uploaded.id, 
      labels,
      success: true,
      message: '上傳成功'
    });

    // 如果 Token 有更新，設定新的 Token 到 Response Header
    if (tokens.accessToken !== token.accessToken) {
      console.log('Token 已刷新，更新 Session');
      // 注意：這裡無法直接更新 NextAuth Session，需要在前端處理
      response.headers.set('X-Token-Refreshed', 'true');
    }

    return response;

  } catch (error: any) {
    console.error('上傳失敗:', error);
    
    // 如果是授權相關錯誤
    if (error.message?.includes('無法刷新 Access Token')) {
      return new NextResponse('Token 過期，請重新登入', { status: 401 });
    }
    
    return new NextResponse(`上傳失敗: ${error.message}`, { status: 500 });
  }
}