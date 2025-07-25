import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { uploadImageToFolder } from '@/lib/googleDrive';
import sql from '@/lib/db';
import { createHash } from 'crypto';

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
    
    // 處理新的壓縮格式或回退到舊格式
    const compressedBase64 = (formData.get('compressedBase64') as string) ?? '';
    const originalSize = formData.get('originalSize') as string;
    const compressedSize = formData.get('compressedSize') as string;
    
    // 回退到舊格式
    const legacyBase64 = (formData.get('base64') as string) ?? '';
    
    // 決定使用哪個base64數據進行Gemini標籤
    const geminiBase64 = compressedBase64 || legacyBase64;
    
    if (!file) {
      return new NextResponse('No file', { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 計算檔案 hash 來檢查重複（更準確的重複檢測）
    const fileHash = createHash('md5').update(buffer).digest('hex');
    
    const ext = file.name.split('.').pop() ?? 'jpg';
    const uniqueName = `${fileHash}-${Date.now()}.${ext}`;
    
    const existingPhoto = await sql`
      SELECT id, file_id FROM photos 
      WHERE unique_name LIKE ${fileHash + '%'}
      LIMIT 1;
    `;

    if (existingPhoto.length > 0) {
      console.log(`照片 hash ${fileHash} 已存在，跳過重複上傳和 Gemini 呼叫`);
      return NextResponse.json({ 
        uploadedId: existingPhoto[0].file_id, 
        labels: [],
        success: true,
        message: '檔案已存在，跳過重複上傳',
        skipped: true
      });
    }

    console.log(`處理新照片上傳: ${file.name}, hash: ${fileHash}`);

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

    // 使用壓縮後的圖片數據進行 Gemini 標籤生成
    let labels: string[] = [];
    if (geminiBase64) {
      try {
        const clean = geminiBase64.includes(',') ? geminiBase64.split(',')[1] : geminiBase64;
        
        // 記錄壓縮效果
        if (originalSize && compressedSize) {
          console.log(`圖片壓縮: ${originalSize} bytes -> ${compressedSize} bytes (${Math.round((1 - parseInt(compressedSize) / parseInt(originalSize)) * 100)}% 減少)`);
        }
        
        labels = await (await import('@/lib/gemini')).geminiLabels(clean);
        console.log(`Gemini 標籤生成成功: ${labels.join(', ')}`);
      } catch (error) {
        console.error('Gemini 標籤產生失敗:', error);
        // 繼續執行，不因為標籤失敗而中斷上傳
      }
    }

    // 儲存照片到資料庫
    const [photo] = await sql`
      INSERT INTO photos (file_id, name, unique_name, description, image_url)
      VALUES (${uploaded.id}, ${uploaded.name}, ${uniqueName}, ${description}, ${imageUrl})
      RETURNING id;
    `;

    // 儲存標籤
    if (photo?.id && labels.length > 0) {
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