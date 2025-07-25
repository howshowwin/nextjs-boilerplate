'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  CalendarIcon, 
  PhotoIcon, 
  SettingsIcon,
  PlusIcon,
  MenuIcon,
  CloseIcon
} from '@/components/AppleIcons';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  description?: string;
}

const navItems: NavItem[] = [
  {
    name: '首頁',
    href: '/',
    icon: HomeIcon,
    description: '概覽與快速功能'
  },
  {
    name: '行事曆',
    href: '/calendar',
    icon: CalendarIcon,
    description: '管理您的事件與任務'
  },
  {
    name: '照片',
    href: '/photos',
    icon: PhotoIcon,
    description: '瀏覽與管理照片'
  },
  {
    name: '設定',
    href: '/settings',
    icon: SettingsIcon,
    description: '應用程式設定'
  },
];

interface AppleNavigationProps {
  children: React.ReactNode;
}

export default function AppleNavigation({ children }: AppleNavigationProps) {
  const pathname = usePathname();
  const [, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const currentNavItem = navItems.find(item => 
    pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
  );

  // Desktop Sidebar Component
  const DesktopSidebar = () => (
    <aside 
      className="fixed left-0 top-0 h-full w-72 z-40 material-thick border-r border-opacity-20"
      style={{ borderColor: 'var(--separator)' }}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-opacity-20" style={{ borderColor: 'var(--separator)' }}>
          <h1 className="text-title-2" style={{ color: 'var(--foreground)' }}>
            智能生活助手
          </h1>
          <p className="text-footnote mt-1" style={{ color: 'var(--foreground-secondary)' }}>
            個人助理應用程式
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all duration-200
                    ${isActive ? 'interactive-scale' : 'hover:scale-[1.02]'}
                  `}
                  style={{
                    background: isActive ? 'var(--accent)' : 'transparent',
                    color: isActive ? 'white' : 'var(--foreground)'
                  }}
                >
                  <div 
                    className={`p-2 rounded-xl transition-all duration-200`}
                    style={{
                      background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'var(--surface-secondary)',
                      color: isActive ? 'white' : 'var(--foreground-secondary)'
                    }}
                  >
                    <Icon 
                      className="w-5 h-5" 
                      variant={isActive ? 'fill' : 'outline'}
                      weight={isActive ? 'semibold' : 'regular'}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-headline font-semibold">
                      {item.name}
                    </div>
                    <div 
                      className="text-caption-1 opacity-80"
                      style={{ color: isActive ? 'rgba(255, 255, 255, 0.8)' : 'var(--foreground-tertiary)' }}
                    >
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-opacity-20" style={{ borderColor: 'var(--separator)' }}>
          <button
            onClick={() => setShowUpload(true)}
            className="btn-primary w-full interactive-scale"
          >
            <PlusIcon className="w-5 h-5" weight="semibold" />
            新增內容
          </button>
        </div>
      </div>
    </aside>
  );

  // Mobile Tab Bar Component
  const MobileTabBar = () => (
    <>
      {/* Mobile Header */}
      <header className="material-thick sticky top-0 z-40 border-b border-opacity-20 lg:hidden" style={{ borderColor: 'var(--separator)' }}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="interactive-scale p-2 rounded-2xl"
              style={{ 
                background: 'var(--surface-secondary)',
                color: 'var(--foreground-secondary)'
              }}
            >
              <MenuIcon className="w-6 h-6" weight="medium" />
            </button>
            <div>
              <h1 className="text-title-3" style={{ color: 'var(--foreground)' }}>
                {currentNavItem?.name || '智能生活助手'}
              </h1>
            </div>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="btn-primary interactive-scale"
            style={{ padding: '12px', minHeight: 'auto' }}
          >
            <PlusIcon className="w-5 h-5" weight="semibold" />
          </button>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden material-thick border-t border-opacity-20" style={{ borderColor: 'var(--separator)' }}>
        <div className="grid grid-cols-4 px-2 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-200
                  ${isActive ? 'interactive-scale' : 'hover:scale-105'}
                `}
                style={{
                  background: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? 'white' : 'var(--foreground-secondary)'
                }}
              >
                <Icon 
                  className="w-6 h-6 mb-1" 
                  variant={isActive ? 'fill' : 'outline'}
                  weight={isActive ? 'semibold' : 'regular'}
                />
                <span className="text-caption-2 font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 modal-backdrop"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 animate-slide-in-left">
            <div className="h-full material-thick border-r border-opacity-20" style={{ borderColor: 'var(--separator)' }}>
              <div className="flex flex-col h-full">
                {/* Mobile Sidebar Header */}
                <div className="flex items-center justify-between p-6 border-b border-opacity-20" style={{ borderColor: 'var(--separator)' }}>
                  <div>
                    <h2 className="text-title-3" style={{ color: 'var(--foreground)' }}>
                      導航選單
                    </h2>
                    <p className="text-footnote mt-1" style={{ color: 'var(--foreground-secondary)' }}>
                      選擇功能頁面
                    </p>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="interactive-scale p-2 rounded-2xl"
                    style={{ 
                      background: 'var(--surface-secondary)',
                      color: 'var(--foreground-secondary)'
                    }}
                  >
                    <CloseIcon className="w-6 h-6" weight="medium" />
                  </button>
                </div>

                {/* Mobile Navigation Items */}
                <nav className="flex-1 p-4">
                  <div className="space-y-3">
                    {navItems.map((item) => {
                      const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                      const Icon = item.icon;
                      
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`
                            group flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-200
                            ${isActive ? 'interactive-scale' : 'hover:scale-[1.02]'}
                          `}
                          style={{
                            background: isActive ? 'var(--accent)' : 'var(--surface-secondary)',
                            color: isActive ? 'white' : 'var(--foreground)'
                          }}
                        >
                          <div 
                            className="p-3 rounded-xl"
                            style={{
                              background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'var(--surface)',
                              color: isActive ? 'white' : 'var(--accent)'
                            }}
                          >
                            <Icon 
                              className="w-6 h-6" 
                              variant={isActive ? 'fill' : 'outline'}
                              weight={isActive ? 'semibold' : 'regular'}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="text-headline font-semibold">
                              {item.name}
                            </div>
                            <div 
                              className="text-footnote opacity-80"
                              style={{ color: isActive ? 'rgba(255, 255, 255, 0.8)' : 'var(--foreground-tertiary)' }}
                            >
                              {item.description}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Upload Modal Component
  const UploadModal = () => (
    showUpload && (
      <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-6">
        <div className="modal-content w-full max-w-sm animate-spring-up">
          <div className="p-8">
            <div className="text-center mb-8">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-3xl flex items-center justify-center"
                style={{ background: 'rgba(0, 122, 255, 0.1)' }}
              >
                <PlusIcon className="w-8 h-8" style={{ color: 'var(--accent)' }} weight="semibold" />
              </div>
              <h3 className="text-title-3 mb-2" style={{ color: 'var(--foreground)' }}>
                新增內容
              </h3>
              <p className="text-callout" style={{ color: 'var(--foreground-secondary)' }}>
                選擇要新增的內容類型
              </p>
            </div>
            
            <div className="space-y-4">
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    console.log('[AppleNav] 檔案選擇事件觸發, 檔案數量:', files?.length);
                    if (files && files.length) {
                      console.log('[AppleNav] 發送 uploadFiles 事件');
                      window.dispatchEvent(new CustomEvent('uploadFiles', { detail: files }));
                      setShowUpload(false);
                      // 清空 input value 防止重複觸發
                      e.target.value = '';
                    }
                  }}
                />
                <div className="btn-primary w-full justify-center interactive-scale">
                  <PhotoIcon className="w-5 h-5" weight="medium" />
                  上傳照片
                </div>
              </label>
              
              <Link
                href="/calendar"
                onClick={() => setShowUpload(false)}
                className="btn-secondary w-full justify-center interactive-scale"
              >
                <CalendarIcon className="w-5 h-5" weight="medium" />
                新增事件
              </Link>
              
              <button
                onClick={() => setShowUpload(false)}
                className="btn-secondary w-full justify-center interactive-scale"
                style={{ 
                  background: 'transparent',
                  color: 'var(--foreground-secondary)',
                  border: 'none'
                }}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Desktop Layout */}
      <div className="hidden lg:flex">
        <DesktopSidebar />
        <main className="flex-1 ml-72">
          {children}
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <MobileTabBar />
        <main className="pb-20">
          {children}
        </main>
      </div>

      {/* Upload Modal */}
      <UploadModal />
    </div>
  );
}