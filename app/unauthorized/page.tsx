export const metadata = {
  title: '未授權',
};

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-bold text-red-600">存取被拒</h1>
      <p className="text-lg">您的帳號沒有權限使用此網站。</p>
      <a
        href="/api/auth/signout?callbackUrl=/"
        className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
      >
        重新登入
      </a>
    </main>
  );
} 