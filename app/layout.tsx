import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppleNavigation from "@/components/AppleNavigation";
import AuthSessionProvider from "@/components/SessionProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "智能生活助手 - 行事曆與相簿",
  description: "Apple 風格的智能生活助手，整合行事曆任務管理和 AI 相簿功能",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={`${inter.variable} antialiased`}>
        <AuthSessionProvider>
          <AppleNavigation>
            {children}
          </AppleNavigation>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
