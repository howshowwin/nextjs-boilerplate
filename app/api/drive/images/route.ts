import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.accessToken) return new NextResponse('Unauthorized', { status: 401 });

  const folderId = process.env.DRIVE_FOLDER_ID;
  if (!folderId)
    return new NextResponse('Missing DRIVE_FOLDER_ID', { status: 500 });

  const { searchParams } = new URL(req.url);
  const pageToken = searchParams.get('pageToken') ?? undefined;

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  auth.setCredentials({
    access_token: String(token.accessToken),
    refresh_token: (token as any).refreshToken as string | undefined,
  });

  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
    fields: 'nextPageToken, files(id,name)',
    pageSize: 30,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    pageToken,
  });

  const items = (res.data.files ?? []).map((f) => {
    const id = f.id ?? '';
   
    return {
      id,
      name: f.name ?? '',
      url: `https://lh3.googleusercontent.com/d/${id}=w600-h600`, // grid preview
      full: `https://lh3.googleusercontent.com/d/${id}=w2400`, // lightbox full size
    };
  });

  return NextResponse.json({ items, nextPageToken: res.data.nextPageToken ?? null });
} 