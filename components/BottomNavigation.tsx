'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  PhotoIcon, 
  HeartIcon, 
  FolderIcon, 
  Cog6ToothIcon,
  PlusIcon 
} from '@heroicons/react/24/outline';
import { 
  PhotoIcon as PhotoIconSolid, 
  HeartIcon as HeartIconSolid, 
  FolderIcon as FolderIconSolid, 
  Cog6ToothIcon as Cog6ToothIconSolid 
} from '@heroicons/react/24/solid';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  activeIcon: React.ComponentType<any>;
}

const navItems: NavItem[] = [
  {
    name: '照片',
    href: '/photos',
    icon: PhotoIcon,
    activeIcon: PhotoIconSolid,
  },
  {
    name: '收藏',
    href: '/favorites',
    icon: HeartIcon,
    activeIcon: HeartIconSolid,
  },
  {
    name: '相簿',
    href: '/albums',
    icon: FolderIcon,
    activeIcon: FolderIconSolid,
  },
  {
    name: '設定',
    href: '/settings',
    icon: Cog6ToothIcon,
    activeIcon: Cog6ToothIconSolid,
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const [showUpload, setShowUpload] = useState(false);

  return (
    <>
      {/* 上傳按鈕 */}
      <button
        onClick={() => setShowUpload(true)}
        className="fixed bottom-20 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-all duration-300 hover:scale-110"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {/* 底部導航 */}
      <nav
        className="bottom-nav fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 z-30 transition-transform duration-300"
      >
        <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = isActive ? item.activeIcon : item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'text-blue-500' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 上傳模態框 */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm animate-scale-in">
            <h3 className="text-lg font-semibold mb-4 text-center">上傳照片</h3>
            
            <div className="space-y-3">
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length) {
                      // 觸發上傳事件
                      window.dispatchEvent(new CustomEvent('uploadFiles', { detail: files }));
                      setShowUpload(false);
                    }
                  }}
                />
                <div className="btn-primary w-full justify-center">
                  <PhotoIcon className="w-5 h-5" />
                  選擇照片
                </div>
              </label>
              
              <button
                onClick={() => setShowUpload(false)}
                className="btn-secondary w-full justify-center"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 