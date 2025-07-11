'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { 
  Squares2X2Icon, 
  ListBulletIcon, 
  FunnelIcon,
  ArrowUpTrayIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';

// 動態導入組件
const Lightbox = dynamic(() => import('yet-another-react-lightbox'), { ssr: false });
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

import PhotoCard from '@/components/PhotoCard';
import SearchBar from '@/components/SearchBar';
import BottomNavigation from '@/components/BottomNavigation';
import { uploadFile, handleAuthError } from '@/lib/auth-utils';

interface Photo {
  id: number;
  name: string;
  image_url: string;
  labels: string[];
  isFavorite?: boolean;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'date' | 'name' | 'size';

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // 載入照片
  const loadPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/photos');
      const data = await response.json();
      setPhotos(data);
      setFilteredPhotos(data);
    } catch (error) {
      console.error('載入照片失敗:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPhotos();
    
    // 監聽上傳事件
    const handleUploadFiles = (event: CustomEvent) => {
      handleUpload(event.detail);
    };
    
    window.addEventListener('uploadFiles', handleUploadFiles as EventListener);
    
    return () => {
      window.removeEventListener('uploadFiles', handleUploadFiles as EventListener);
    };
  }, [loadPhotos]);

  // 搜尋功能
  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setFilteredPhotos(photos);
      return;
    }

    const Fuse = require('fuse.js');
    const fuse = new Fuse(photos, {
      keys: ['name', 'labels'],
      threshold: 0.4,
    });
    
    const results = fuse.search(query).map((result: any) => result.item);
    setFilteredPhotos(results);
  }, [photos]);

  // 上傳照片（使用新的 auth utils）
  const handleUpload = async (files: FileList) => {
    setUploading(true);
    setUploadTotal(files.length);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          await uploadFile(file);
          setUploadProgress(i + 1);
        } catch (error) {
          console.error(`上傳檔案 ${file.name} 失敗:`, error);
          handleAuthError(error);
          // 如果是授權錯誤，會自動導向錯誤頁面
          // 其他錯誤繼續處理下一個檔案
        }
      }

      await loadPhotos();
    } catch (error) {
      console.error('上傳過程發生錯誤:', error);
      handleAuthError(error);
    } finally {
      setUploading(false);
    }
  };

  // 照片操作
  const handlePhotoSelect = (photo: Photo) => {
    if (selectionMode) {
      const newSelected = new Set(selectedPhotos);
      if (newSelected.has(photo.id)) {
        newSelected.delete(photo.id);
      } else {
        newSelected.add(photo.id);
      }
      setSelectedPhotos(newSelected);
    } else {
      const index = filteredPhotos.findIndex(p => p.id === photo.id);
      setCurrentIndex(index);
      setLightboxOpen(true);
    }
  };

  const handleFavorite = async (photo: Photo) => {
    // 收藏功能待實現
    console.log('收藏照片:', photo.id);
  };

  const handleDelete = async (photo: Photo) => {
    if (confirm('確定要刪除這張照片嗎？')) {
      try {
        await fetch(`/api/photos/${photo.id}`, { method: 'DELETE' });
        await loadPhotos();
      } catch (error) {
        console.error('刪除失敗:', error);
      }
    }
  };

  const handleShare = (photo: Photo) => {
    if (navigator.share) {
      navigator.share({
        title: photo.name,
        url: photo.image_url,
      });
    } else {
      navigator.clipboard.writeText(photo.image_url);
      alert('連結已複製到剪貼簿');
    }
  };

  // Lightbox 幻燈片
  const slides = filteredPhotos.map((photo) => ({
    src: `/_next/image?url=${encodeURIComponent(photo.image_url)}&w=2048&q=90`,
    title: photo.name,
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-20">
      {/* 頂部導航 */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">照片</h1>
            <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
              {filteredPhotos.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* 檢視模式切換 */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-700 shadow-sm' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-700 shadow-sm' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>

            {/* 更多選項 */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <EllipsisHorizontalIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 搜尋欄 */}
        <div className="px-4 pb-3">
          <SearchBar onSearch={handleSearch} />
        </div>
      </header>

      {/* 上傳進度 */}
      {uploading && (
        <div className="fixed top-20 left-4 right-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 z-30 animate-slide-up">
          <div className="flex items-center gap-3">
            <ArrowUpTrayIcon className="w-5 h-5 text-blue-500" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>上傳中...</span>
                <span>{uploadProgress}/{uploadTotal}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(uploadProgress / uploadTotal) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 主要內容 */}
      <main className="px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              沒有找到照片
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              開始上傳您的第一張照片吧
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'photo-grid' : 'space-y-4'}>
            {filteredPhotos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onSelect={handlePhotoSelect}
                onFavorite={handleFavorite}
                onDelete={handleDelete}
                onShare={handleShare}
                isSelected={selectedPhotos.has(photo.id)}
                selectionMode={selectionMode}
              />
            ))}
          </div>
        )}
      </main>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={currentIndex}
          slides={slides}
          plugins={[Fullscreen, Zoom] as any}
        />
      )}

      {/* 底部導航 */}
      <BottomNavigation />
    </div>
  );
} 