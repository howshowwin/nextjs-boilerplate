import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;

  const { pathname } = req.nextUrl;

  // 只保護首頁，如果未登入跳 sign-in
  if (!isAuth && pathname === '/') {
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
  matcher: ['/', '/index'],
}; 