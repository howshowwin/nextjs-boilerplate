'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { uploadFile, importPhotos, getDriveImages, handleAuthError } from '@/lib/auth-utils';

export default function TestAuthPage() {
  const { data: session, status } = useSession();
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testUpload = async () => {
    setLoading(true);
    try {
      // 創建一個測試檔案
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 100, 100);
      }
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          const testFile = new File([blob], 'test-image.png', { type: 'image/png' });
          const result = await uploadFile(testFile, 'Token 刷新測試圖片');
          setResult(`上傳成功: ${JSON.stringify(result, null, 2)}`);
        }
      });
    } catch (error) {
      setResult(`上傳失敗: ${error}`);
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const testImport = async () => {
    setLoading(true);
    try {
      const result = await importPhotos();
      setResult(`匯入成功: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setResult(`匯入失敗: ${error}`);
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const testDriveImages = async () => {
    setLoading(true);
    try {
      const result = await getDriveImages();
      setResult(`取得 Drive 圖片成功: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setResult(`取得 Drive 圖片失敗: ${error}`);
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const testDirectAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/photos/import', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      const result = await response.json();
      setResult(`直接 API 呼叫成功: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setResult(`直接 API 呼叫失敗: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">需要登入</h1>
          <p>請先登入以測試 Token 刷新功能</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Google Drive API Token 刷新測試</h1>
        
        {/* Session 資訊 */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session 資訊</h2>
          <div className="space-y-2 text-sm">
            <p><strong>用戶:</strong> {session?.user?.email}</p>
            <p><strong>Access Token:</strong> {(session as any)?.accessToken ? '已設定' : '未設定'}</p>
            <p><strong>Refresh Token:</strong> {(session as any)?.refreshToken ? '已設定' : '未設定'}</p>
            <p><strong>錯誤:</strong> {(session as any)?.error || '無'}</p>
          </div>
        </div>

        {/* 測試按鈕 */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API 測試</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={testUpload}
              disabled={loading}
              className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '測試中...' : '測試上傳 (Token 刷新)'}
            </button>
            
            <button
              onClick={testImport}
              disabled={loading}
              className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? '測試中...' : '測試匯入 (Token 刷新)'}
            </button>
            
            <button
              onClick={testDriveImages}
              disabled={loading}
              className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? '測試中...' : '測試 Drive 圖片 (Token 刷新)'}
            </button>
            
            <button
              onClick={testDirectAPI}
              disabled={loading}
              className="p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? '測試中...' : '直接 API 呼叫'}
            </button>
          </div>
        </div>

        {/* 結果顯示 */}
        {result && (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">測試結果</h2>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto text-sm">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 