'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  UserCircleIcon,
  CloudIcon,
  MoonIcon,
  SunIcon,
  InformationCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import BottomNavigation from '@/components/BottomNavigation';

interface SettingItem {
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
  action: () => void;
  toggle?: boolean;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [darkMode, setDarkMode] = useState(false);

  const settingsGroups: { title: string; items: SettingItem[] }[] = [
    {
      title: '帳戶',
      items: [
        {
          icon: UserCircleIcon,
          title: '個人資料',
          subtitle: session?.user?.email || '未登入',
          action: () => {},
        },
        {
          icon: CloudIcon,
          title: '儲存空間',
          subtitle: '查看使用情況',
          action: () => {},
        },
      ],
    },
    {
      title: '顯示',
      items: [
        {
          icon: darkMode ? MoonIcon : SunIcon,
          title: '深色模式',
          subtitle: darkMode ? '已開啟' : '已關閉',
          action: () => setDarkMode(!darkMode),
          toggle: true,
        },
      ],
    },
    {
      title: '關於',
      items: [
        {
          icon: InformationCircleIcon,
          title: '應用程式資訊',
          subtitle: '版本 1.0.0',
          action: () => {},
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-20">
      {/* 頂部導航 */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-2xl font-bold">設定</h1>
        </div>
      </header>

      {/* 主要內容 */}
      <main className="px-4 py-6">
        {/* 使用者資訊 */}
        {session && (
          <div className="card p-6 mb-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <UserCircleIcon className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <h2 className="text-xl font-semibold mb-1">
              {session.user?.name || '使用者'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {session.user?.email}
            </p>
          </div>
        )}

        {/* 設定選項 */}
        <div className="space-y-6">
          {settingsGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="card overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {group.title}
                </h3>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {group.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={itemIndex}
                      onClick={item.action}
                      className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-6 h-6 text-gray-400" />
                        <div className="text-left">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>

                      {item.toggle ? (
                        <div
                          className={`w-12 h-6 rounded-full transition-colors ${
                            darkMode ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform mt-0.5 ${
                              darkMode
                                ? 'translate-x-6 ml-1'
                                : 'translate-x-0 ml-1'
                            }`}
                          />
                        </div>
                      ) : (
                        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 登出按鈕 */}
        {session && (
          <div className="mt-8">
            <button
              onClick={() => signOut({ callbackUrl: '/api/auth/signin' })}
              className="w-full card p-4 flex items-center justify-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              登出
            </button>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
