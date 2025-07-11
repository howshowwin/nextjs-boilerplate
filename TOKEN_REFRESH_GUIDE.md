# Google Drive API Token 刷新系統

## 概述

本系統解決了 Google Drive API 中 Access Token 過期導致的 `Invalid Credentials (401)` 錯誤問題。透過自動 Token 刷新機制，確保 API 呼叫的穩定性和用戶體驗的連續性。

## 主要特性

### 1. 自動 Token 刷新
- 在 NextAuth JWT callback 中自動檢查 Token 過期時間
- 提前 5 分鐘自動刷新 Access Token
- 使用 Refresh Token 進行無感知的 Token 更新

### 2. 錯誤處理與重試
- 自動捕獲 401 錯誤並嘗試 Token 刷新
- 智能重試機制，避免無限循環
- 友好的錯誤頁面和用戶提示

### 3. 統一的 API 介面
- 封裝所有 Google Drive 操作
- 統一的錯誤處理流程
- 簡化的前端呼叫方式

## 架構說明

### 後端架構

```
lib/googleDrive.ts
├── executeWithTokenRefresh() - 核心 Token 刷新邏輯
├── uploadImageToFolder() - 上傳圖片並自動刷新 Token
├── listImagesFromFolder() - 列出圖片並自動刷新 Token
└── listImagesWithPagination() - 分頁列出圖片並自動刷新 Token
```

### NextAuth 配置

```
app/api/auth/[...nextauth]/route.ts
├── refreshAccessToken() - 刷新 Access Token 函數
├── jwt callback - 自動檢查並刷新過期 Token
└── session callback - 將 Token 資訊傳遞給前端
```

### 前端工具

```
lib/auth-utils.ts
├── apiRequest() - 統一的 API 請求處理
├── uploadFile() - 檔案上傳封裝
├── importPhotos() - 照片匯入封裝
├── getDriveImages() - 取得 Drive 圖片封裝
└── handleAuthError() - 統一的錯誤處理
```

## 使用方法

### 1. 環境變數設定

確保以下環境變數已正確設定：

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_nextauth_secret
DRIVE_FOLDER_ID=your_drive_folder_id
```

### 2. Google Cloud Console 設定

1. 啟用 Google Drive API
2. 創建 OAuth 2.0 憑證
3. 設定授權的重新導向 URI：
   - `https://your-domain.com/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google`（開發環境）

### 3. 前端使用範例

#### 上傳檔案

```typescript
import { uploadFile, handleAuthError } from '@/lib/auth-utils';

const handleFileUpload = async (file: File) => {
  try {
    const result = await uploadFile(file, '檔案描述');
    console.log('上傳成功:', result);
  } catch (error) {
    handleAuthError(error); // 自動處理授權錯誤
  }
};
```

#### 匯入照片

```typescript
import { importPhotos, handleAuthError } from '@/lib/auth-utils';

const handleImport = async () => {
  try {
    const result = await importPhotos();
    console.log('匯入成功:', result);
  } catch (error) {
    handleAuthError(error);
  }
};
```

#### 取得 Drive 圖片

```typescript
import { getDriveImages, handleAuthError } from '@/lib/auth-utils';

const loadImages = async () => {
  try {
    const result = await getDriveImages();
    console.log('取得圖片成功:', result);
  } catch (error) {
    handleAuthError(error);
  }
};
```

### 4. 後端 API 使用範例

```typescript
import { uploadImageToFolder } from '@/lib/googleDrive';

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  try {
    const { file: uploaded, tokens } = await uploadImageToFolder(
      String(token.accessToken),
      folderId,
      fileName,
      mimeType,
      buffer,
      token.refreshToken
    );
    
    // 檢查 Token 是否有更新
    if (tokens.accessToken !== token.accessToken) {
      console.log('Token 已刷新');
      response.headers.set('X-Token-Refreshed', 'true');
    }
    
    return NextResponse.json({ success: true, file: uploaded });
  } catch (error) {
    if (error.message?.includes('無法刷新 Access Token')) {
      return new NextResponse('Token 過期，請重新登入', { status: 401 });
    }
    throw error;
  }
}
```

## 測試方法

### 1. 使用測試頁面

訪問 `/test-auth` 頁面進行功能測試：

- 查看 Session 資訊
- 測試檔案上傳
- 測試照片匯入
- 測試 Drive 圖片取得
- 直接 API 呼叫測試

### 2. 模擬 Token 過期

1. 在 Google Cloud Console 中撤銷應用程式授權
2. 嘗試執行 API 操作
3. 觀察系統是否正確處理錯誤並引導重新授權

### 3. 監控日誌

查看以下日誌訊息：

```
Access Token 即將過期，開始刷新...
Token refresh failed: [錯誤詳情]
Token 已刷新，更新 Session
收到 401 錯誤，嘗試刷新 Token...
```

## 錯誤處理

### 1. 常見錯誤類型

- `RefreshAccessTokenError`: Refresh Token 過期或無效
- `OAuthCallbackError`: OAuth 回調過程中的錯誤
- `AccessDenied`: 用戶拒絕授權
- `Configuration`: 系統配置錯誤

### 2. 錯誤頁面

系統會自動導向 `/auth/error` 頁面，並根據錯誤類型顯示相應的訊息和操作選項。

### 3. 手動錯誤處理

```typescript
import { handleAuthError } from '@/lib/auth-utils';

try {
  // API 呼叫
} catch (error) {
  handleAuthError(error); // 自動判斷錯誤類型並處理
}
```

## 最佳實踐

### 1. 前端

- 使用 `auth-utils` 中的封裝函數
- 統一使用 `handleAuthError` 處理錯誤
- 監聽 `X-Token-Refreshed` 標頭來更新 UI

### 2. 後端

- 使用 `executeWithTokenRefresh` 包裝所有 Drive API 呼叫
- 檢查並回傳更新後的 Token 資訊
- 提供清晰的錯誤訊息

### 3. 安全性

- 定期檢查 Refresh Token 的有效性
- 實施適當的速率限制
- 記錄授權相關的重要操作

## 故障排除

### 1. Token 無法刷新

- 檢查 Google Cloud Console 中的 OAuth 設定
- 確認 Refresh Token 是否正確儲存
- 驗證 Client ID 和 Client Secret

### 2. 重新導向錯誤

- 確認 NEXTAUTH_URL 設定正確
- 檢查 Google OAuth 中的重新導向 URI 設定
- 驗證 HTTPS 配置（生產環境）

### 3. 權限問題

- 確認 Google Drive API 已啟用
- 檢查 OAuth 範圍設定
- 驗證 Drive 資料夾權限

## 更新日誌

### v1.0.0 (2024-01-XX)
- 初始版本
- 實現自動 Token 刷新機制
- 添加統一的錯誤處理
- 創建測試頁面和文檔 