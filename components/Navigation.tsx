'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, CalendarIcon, PhotoIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeIconSolid, CalendarIcon as CalendarIconSolid, PhotoIcon as PhotoIconSolid, Cog6ToothIcon as Cog6ToothIconSolid } from '@heroicons/react/24/solid';

const Navigation = () => {
  const pathname = usePathname();

  const navItems = [
    {
      name: '首頁',
      href: '/',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
    },
    {
      name: '行事曆',
      href: '/calendar',
      icon: CalendarIcon,
      iconSolid: CalendarIconSolid,
    },
    {
      name: '相簿',
      href: '/photos',
      icon: PhotoIcon,
      iconSolid: PhotoIconSolid,
    },
    {
      name: '設定',
      href: '/settings',
      icon: Cog6ToothIcon,
      iconSolid: Cog6ToothIconSolid,
    },
  ];

  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-800/50 safe-area-pb transition-transform duration-300">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = isActive ? item.iconSolid : item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 