import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * 刷新 Google Access Token
 */
async function refreshAccessToken(token: any) {
  try {
    const url = "https://oauth2.googleapis.com/token";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("刷新 Access Token 失敗:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            'openid email profile https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.readonly',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }: { user: { email?: string | null } }) {
      const allowList = (process.env.ALLOWED_EMAILS || '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      if (allowList.length === 0) return true; // 未設定名單=>全部接受

      if (user.email && allowList.includes(user.email.toLowerCase())) {
        return true;
      }
      // 拒絕登入並導向自訂頁面
      return '/unauthorized';
    },

    async jwt({ token, account, user }) {
      // 初次登入
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000,
        };
      }

      // 檢查 Access Token 是否即將過期（提前 5 分鐘刷新）
      if (token.accessTokenExpires && Date.now() < Number(token.accessTokenExpires) - 5 * 60 * 1000) {
        return token;
      }

      // Access Token 過期，嘗試刷新
      console.log("Access Token 即將過期，開始刷新...");
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      if (token) {
        (session as any).accessToken = token.accessToken;
        (session as any).refreshToken = token.refreshToken;
        (session as any).error = token.error;
      }
      return session;
    },
  },
  pages: {
    error: '/auth/error', // 自訂錯誤頁面
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 