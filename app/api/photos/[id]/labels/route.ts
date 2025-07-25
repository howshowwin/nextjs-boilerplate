import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.accessToken) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { labels } = await req.json();
    const resolvedParams = await params;
    const photoId = resolvedParams.id;

    if (!Array.isArray(labels)) {
      return new NextResponse('Labels must be an array', { status: 400 });
    }

    // 檢查照片是否存在
    const photo = await sql`
      SELECT id FROM photos WHERE id = ${photoId} LIMIT 1;
    `;

    if (photo.length === 0) {
      return new NextResponse('Photo not found', { status: 404 });
    }

    // 刪除現有標籤
    await sql`
      DELETE FROM photo_labels WHERE photo_id = ${photoId};
    `;

    // 添加新標籤
    for (const label of labels) {
      if (label && label.trim()) {
        await sql`
          INSERT INTO photo_labels (photo_id, label) 
          VALUES (${photoId}, ${label.trim()});
        `;
      }
    }

    return NextResponse.json({ 
      success: true,
      message: '標籤更新成功',
      labels: labels.filter(label => label && label.trim())
    });

  } catch (error: unknown) {
    console.error('更新標籤失敗:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(`更新標籤失敗: ${errorMessage}`, { status: 500 });
  }
}