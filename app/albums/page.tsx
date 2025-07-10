'use client';

import { useState } from 'react';
import { FolderIcon, PlusIcon } from '@heroicons/react/24/outline';
import BottomNavigation from '@/components/BottomNavigation';
import SearchBar from '@/components/SearchBar';

export default function AlbumsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-20">
      {/* 頂部導航 */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">相簿</h1>
            <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
              0
            </span>
          </div>

          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 搜尋欄 */}
        <div className="px-4 pb-3">
          <SearchBar onSearch={setSearchQuery} placeholder="搜尋相簿..." />
        </div>
      </header>

      {/* 主要內容 */}
      <main className="px-4 py-6">
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <FolderIcon className="w-full h-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            還沒有相簿
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            建立相簿來整理您的照片
          </p>
          <button className="btn-primary">
            <PlusIcon className="w-5 h-5" />
            建立相簿
          </button>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
} 