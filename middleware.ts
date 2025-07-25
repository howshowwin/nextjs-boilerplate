import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;

  const { pathname } = req.nextUrl;

  // 不需要保護的頁面路徑
  const publicPaths = ['/unauthorized', '/auth/error'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // 如果未登入且不是公開頁面，導向登入頁
  if (!isAuth && !isPublicPath) {
    const signInUrl = new URL('/api/auth/signin', req.url);
    // callbackUrl 讓登入後跳回原頁面
    signInUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // 驗證 email 是否在允許清單中
  if (isAuth && pathname !== '/unauthorized') {
    const allowed = (process.env.ALLOWED_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (allowed.length > 0 && token?.email) {
      const ok = allowed.includes(token.email.toLowerCase());
      if (!ok) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有請求路徑，除了以下開頭的路徑：
     * - api (API routes)
     * - _next/static (靜態檔案)
     * - _next/image (圖片優化檔案) 
     * - favicon.ico (favicon檔案)
     * - auth (NextAuth頁面)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 