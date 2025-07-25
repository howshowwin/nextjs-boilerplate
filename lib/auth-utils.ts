import { signOut } from 'next-auth/react';

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
 * 上傳檔案的 API 請求（包含圖片壓縮）
 */
// 全局重複請求檢測
const activeUploads = new Map<string, Promise<any>>();

export async function uploadFile(file: File, description?: string) {
  // 創建檔案唯一標識
  const fileKey = `${file.name}_${file.size}_${file.lastModified}`;
  
  // 檢查是否已經有相同檔案在上傳中
  if (activeUploads.has(fileKey)) {
    console.log(`[DUPLICATE] 檔案 ${file.name} 已在上傳中，返回現有Promise`);
    return activeUploads.get(fileKey);
  }
  
  const uploadId = Math.random().toString(36).substr(2, 9);
  console.log(`[${uploadId}] 開始上傳檔案: ${file.name}, 大小: ${file.size} bytes`);
  
  // 創建上傳 Promise 並加入 Map
  const uploadPromise = (async () => {
    try {
      // 動態導入圖片壓縮工具（避免SSR問題）
      const { compressImage } = await import('./imageCompression');
      
      // 壓縮圖片
      console.log(`[${uploadId}] 開始壓縮圖片...`);
      const compressionResult = await compressImage(file);
    
      const formData = new FormData();
      formData.append('file', file);
      formData.append('originalBase64', compressionResult.originalBase64);
      formData.append('compressedBase64', compressionResult.compressedBase64);
      formData.append('originalSize', compressionResult.originalSize.toString());
      formData.append('compressedSize', compressionResult.compressedSize.toString());
      
      if (description) {
        formData.append('description', description);
      }

      console.log(`[${uploadId}] 發送上傳請求...`);
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

      const result = await response.json();
      console.log(`[${uploadId}] 上傳完成:`, result);
      return result;
      
    } catch (error) {
      console.error(`[${uploadId}] 檔案處理失敗:`, error);
      
      // 如果壓縮失敗，回退到原始方法
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
      });

      if (!response) {
        throw new Error('上傳失敗：授權過期');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`上傳失敗: ${errorText}`);
      }

      return response.json();
    } finally {
      // 完成後從 Map 中移除
      activeUploads.delete(fileKey);
      console.log(`[${uploadId}] 從活動上傳列表中移除`);
    }
  })();

  // 將 Promise 加入 Map
  activeUploads.set(fileKey, uploadPromise);
  console.log(`[${uploadId}] 加入活動上傳列表, 當前活動上傳數: ${activeUploads.size}`);
  
  return uploadPromise;
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