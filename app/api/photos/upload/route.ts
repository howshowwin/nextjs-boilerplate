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

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const description = (formData.get('description') as string) ?? '';
  const base64Data = (formData.get('base64') as string) ?? '';
  if (!file) return new NextResponse('No file', { status: 400 });

  const ext = file.name.split('.').pop() ?? 'jpg';
  const uniqueName = `${Date.now()}-${randomUUID()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const folderId = process.env.DRIVE_FOLDER_ID!;
  const uploaded = await uploadImageToFolder(
    String(token.accessToken),
    folderId,
    uniqueName,
    file.type,
    buffer,
    (token as any).refreshToken as string | undefined,
  );

  const imageUrl = `https://drive.google.com/uc?export=download&id=${uploaded.id}`;

  // ensure columns
  await sql`ALTER TABLE photos ADD COLUMN IF NOT EXISTS description TEXT;`;
  await sql`ALTER TABLE photos ADD COLUMN IF NOT EXISTS unique_name TEXT;`;

  let labels: string[] = [];
  if (base64Data) {
    const clean = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    labels = await (await import('@/lib/gemini')).geminiLabels(clean);
  }

  const [photo] = await sql`
      INSERT INTO photos (file_id, name, unique_name, description, image_url)
      VALUES (${uploaded.id}, ${uploaded.name}, ${uniqueName}, ${description}, ${imageUrl})
      ON CONFLICT (file_id) DO NOTHING
      RETURNING id;
    `;

    if (photo?.id) {
      for (const label of labels) {
        await sql`INSERT INTO photo_labels (photo_id, label) VALUES (${photo.id}, ${label});`;
      }
    }

    return NextResponse.json({ uploadedId: uploaded.id, labels });
 }