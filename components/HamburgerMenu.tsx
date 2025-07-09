'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <>
      {/* Hamburger Button */}
      <button
        aria-label="Menu"
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-40 rounded-md p-2 bg-black/80 text-white backdrop-blur-md hover:bg-black"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30" // clicking overlay closes
          onClick={() => setOpen(false)}
        />
      )}

      {/* Side Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-white dark:bg-neutral-900 shadow-lg z-40 transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
          <span className="font-bold text-lg">選單</span>
          <button onClick={() => setOpen(false)} aria-label="Close" className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex flex-col p-4 gap-3 text-lg">
          <Link href="/" className="hover:font-semibold" onClick={() => setOpen(false)}>
            回首頁
          </Link>
          <Link href="/preview" className="hover:font-semibold" onClick={() => setOpen(false)}>
            Drive 預覽
          </Link>
          {/* 其他頁面可依需求加入 */}
        </nav>

        {session && (
          <div className="mt-auto p-4 border-t border-neutral-200 dark:border-neutral-700">
            <button
              onClick={() => {
                signOut({ callbackUrl: '/api/auth/signin' });
              }}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded"
            >
              登出
            </button>
          </div>
        )}
      </aside>
    </>
  );
} 