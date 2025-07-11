import { google } from 'googleapis';
import { Readable } from 'stream';

interface TokenInfo {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

interface RefreshedTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

/**
 * 建立 Google Drive 實例並處理 Token 刷新
 */
async function getDriveWithTokenRefresh(tokenInfo: TokenInfo): Promise<{
  drive: any;
  tokens: RefreshedTokens;
}> {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + '/api/auth/callback/google'
  );

  // 設定憑證
  auth.setCredentials({
    access_token: tokenInfo.accessToken,
    refresh_token: tokenInfo.refreshToken,
  });

  // 檢查並刷新 Token
  try {
    const { credentials } = await auth.refreshAccessToken();
    
    // 更新 Token 資訊
    const newTokens: RefreshedTokens = {
      accessToken: credentials.access_token!,
      refreshToken: credentials.refresh_token || tokenInfo.refreshToken,
      expiresAt: credentials.expiry_date || undefined,
    };

    // 設定新的憑證
    auth.setCredentials(credentials);
    
    return {
      drive: google.drive({ version: 'v3', auth }),
      tokens: newTokens,
    };
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw new Error('無法刷新 Access Token，請重新登入');
  }
}

/**
 * 執行 Google Drive 操作並自動處理 Token 刷新
 */
async function executeWithTokenRefresh<T>(
  tokenInfo: TokenInfo,
  operation: (drive: any) => Promise<T>
): Promise<{ result: T; tokens: RefreshedTokens }> {
  const { drive, tokens } = await getDriveWithTokenRefresh(tokenInfo);
  
  try {
    const result = await operation(drive);
    return { result, tokens };
  } catch (error: any) {
    // 如果是 401 錯誤，嘗試再次刷新 Token
    if (error.code === 401 || error.message?.includes('Invalid Credentials')) {
      console.log('收到 401 錯誤，嘗試刷新 Token...');
      const { drive: newDrive, tokens: newTokens } = await getDriveWithTokenRefresh(tokenInfo);
      const result = await operation(newDrive);
      return { result, tokens: newTokens };
    }
    throw error;
  }
}

/**
 * 列出資料夾中的圖片
 */
export async function listImagesFromFolder(
  accessToken: string,
  folderId: string,
  refreshToken?: string
): Promise<{ files: any[]; tokens: RefreshedTokens }> {
  const tokenInfo: TokenInfo = {
    accessToken,
    refreshToken,
  };

  const operation = async (drive: any) => {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'files(id,name,mimeType,thumbnailLink,webContentLink,createdTime)',
      pageSize: 1000,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    return res.data.files ?? [];
  };

  const { result, tokens } = await executeWithTokenRefresh(tokenInfo, operation);
  return { files: result, tokens };
}

/**
 * 上傳圖片到資料夾
 */
export async function uploadImageToFolder(
  accessToken: string,
  folderId: string,
  fileName: string,
  mimeType: string,
  fileBuffer: Buffer,
  refreshToken?: string
): Promise<{ file: any; tokens: RefreshedTokens }> {
  const tokenInfo: TokenInfo = {
    accessToken,
    refreshToken,
  };

  const operation = async (drive: any) => {
    // 上傳檔案
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
  };

  const { result, tokens } = await executeWithTokenRefresh(tokenInfo, operation);
  return { file: result, tokens };
}

/**
 * 取得資料夾中的圖片（分頁）
 */
export async function listImagesWithPagination(
  accessToken: string,
  folderId: string,
  pageToken?: string,
  refreshToken?: string
): Promise<{ files: any[]; nextPageToken?: string; tokens: RefreshedTokens }> {
  const tokenInfo: TokenInfo = {
    accessToken,
    refreshToken,
  };

  const operation = async (drive: any) => {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'nextPageToken, files(id,name,mimeType,thumbnailLink,webContentLink,createdTime)',
      pageSize: 30,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      pageToken,
    });
    
    return {
      files: res.data.files ?? [],
      nextPageToken: res.data.nextPageToken,
    };
  };

  const { result, tokens } = await executeWithTokenRefresh(tokenInfo, operation);
  return { 
    files: result.files, 
    nextPageToken: result.nextPageToken,
    tokens 
  };
} 