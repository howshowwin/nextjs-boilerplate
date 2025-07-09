import { google } from 'googleapis';
import { Readable } from 'stream';

function getDrive(accessToken: string, refreshToken?: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return google.drive({ version: 'v3', auth });
}

export async function listImagesFromFolder(accessToken: string, folderId: string, refreshToken?: string) {
  const drive = getDrive(accessToken, refreshToken);
  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
    fields: 'files(id,name,mimeType,thumbnailLink,webContentLink,createdTime)',
    pageSize: 1000,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  return res.data.files ?? [];
}

export async function uploadImageToFolder(
  accessToken: string,
  folderId: string,
  fileName: string,
  mimeType: string,
  fileBuffer: Buffer,
  refreshToken?: string,
) {
  const drive = getDrive(accessToken, refreshToken);

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
      mimeType,
    },
    media: {
      mimeType,
      body: Readable.from(fileBuffer),
    },
    fields: 'id,name,mimeType',
    supportsAllDrives: true,
  });

  const file = res.data;

  // 設定成公開可讀
  await drive.permissions.create({
    fileId: file.id!,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
    supportsAllDrives: true,
  });

  return file;
} 