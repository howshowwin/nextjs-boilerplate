'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

function AuthErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    switch (errorParam) {
      case 'RefreshAccessTokenError':
        setError('登入憑證已過期，請重新登入');
        break;
      case 'OAuthCallbackError':
        setError('Google 登入發生錯誤，請重試');
        break;
      case 'AccessDenied':
        setError('存取被拒絕，請確認您有權限使用此應用程式');
        break;
      case 'Configuration':
        setError('系統設定錯誤，請聯繫管理員');
        break;
      default:
        setError('登入時發生未知錯誤');
    }
  }, [searchParams]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await signIn('google', { 
        callbackUrl: '/',
        redirect: true
      });
    } catch (error) {
      console.error('重新登入失敗:', error);
      setRetrying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              登入錯誤
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {error}
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {retrying ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                '重新登入'
              )}
            </button>

            <button
              onClick={() => router.push('/')}
              className="w-full text-gray-600 dark:text-gray-400 py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              返回首頁
            </button>
          </div>

          <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
            <p>如果問題持續發生，請聯繫系統管理員</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
} 