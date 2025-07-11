import { signIn, signOut } from 'next-auth/react';

/**
 * 處理 API 請求並自動處理 Token 刷新
 */
export async function apiRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
    },
  });

  // 檢查是否有 Token 刷新的標頭
  if (response.headers.get('X-Token-Refreshed') === 'true') {
    console.log('檢測到 Token 已刷新，觸發 Session 更新');
    // 觸發 NextAuth Session 更新
    window.dispatchEvent(new Event('visibilitychange'));
  }

  // 如果是 401 錯誤，可能需要重新登入
  if (response.status === 401) {
    const errorText = await response.text();
    if (errorText.includes('Token 過期')) {
      console.log('Token 已過期，引導用戶重新登入');
      await signOut({ callbackUrl: '/auth/error?error=RefreshAccessTokenError' });
      return null;
    }
  }

  return response;
}

/**
 * 上傳檔案的 API 請求
 */
export async function uploadFile(file: File, description?: string) {
  const base64 = await fileToBase64(file);
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('base64', base64);
  if (description) {
    formData.append('description', description);
  }

  const response = await apiRequest('/api/photos/upload', {
    method: 'POST',
    body: formData,
    // 不設定 Content-Type，讓瀏覽器自動設定 multipart/form-data
  });

  if (!response) {
    throw new Error('上傳失敗：授權過期');
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`上傳失敗: ${errorText}`);
  }

  return response.json();
}

/**
 * 匯入 Google Drive 照片
 */
export async function importPhotos() {
  const response = await apiRequest('/api/photos/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response) {
    throw new Error('匯入失敗：授權過期');
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`匯入失敗: ${errorText}`);
  }

  return response.json();
}

/**
 * 取得 Google Drive 圖片列表
 */
export async function getDriveImages(pageToken?: string) {
  const url = pageToken 
    ? `/api/drive/images?pageToken=${pageToken}`
    : '/api/drive/images';

  const response = await apiRequest(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response) {
    throw new Error('取得圖片失敗：授權過期');
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`取得圖片失敗: ${errorText}`);
  }

  return response.json();
}

/**
 * 將檔案轉換為 Base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 處理授權錯誤
 */
export function handleAuthError(error: any) {
  console.error('授權錯誤:', error);
  
  if (error.message?.includes('授權過期') || error.message?.includes('Token 過期')) {
    signOut({ callbackUrl: '/auth/error?error=RefreshAccessTokenError' });
    return;
  }
  
  // 其他錯誤處理
  throw error;
}

/**
 * 檢查 Session 是否有效
 */
export function isSessionValid(session: any) {
  if (!session?.accessToken) {
    return false;
  }
  
  // 檢查是否有錯誤標記
  if (session.error === 'RefreshAccessTokenError') {
    return false;
  }
  
  return true;
} 