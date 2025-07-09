'use client';

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const [countdown, setCountdown] = useState(10);
  const [invert, setInvert] = useState(false);

  useEffect(() => {
    if (countdown === 0) {
      setInvert(true);
      return;
    }

    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className={`${invert ? 'dark:invert' : ''} transition-all duration-700`}
          style={{
            borderRadius: '50%',
            width: '300px',
            height: '300px',
            objectFit: 'cover',
            objectPosition: 'center',
            border: '2px solid #000',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
          }}
          src="/S__240771185.jpg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2 tracking-[-.01em]">
            這裡有一個卡比
            <span> {countdown} </span>秒後就會變成
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
              母鸚鵡
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
          見證奇蹟的時刻
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/sample"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            還沒做完啦幹
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="/sample2"
            rel="noopener noreferrer"
          >
            不要點這個
          </a>
        </div>
      </main>

    </div>
  );
}
