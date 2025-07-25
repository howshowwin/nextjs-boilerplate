'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { 
  Squares2X2Icon, 
  ListBulletIcon, 
  ArrowUpTrayIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';

// 動態導入組件
const Lightbox = dynamic(() => import('yet-another-react-lightbox'), { ssr: false });
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

import PhotoCard from '@/components/PhotoCard';
import EditLabelsModal from '@/components/EditLabelsModal';
import { uploadFile, handleAuthError } from '@/lib/auth-utils';
import Fuse from 'fuse.js';

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
  const [] = useState<SortBy>('date');
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set());
  const [selectionMode] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);

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

  // 上傳照片（使用新的 auth utils）
  const handleUpload = useCallback(async (files: FileList) => {
    const batchId = Math.random().toString(36).substr(2, 9);
    console.log(`[BATCH-${batchId}] handleUpload 被呼叫, 檔案數量: ${files.length}, 當前上傳狀態: ${uploading}`);
    
    if (uploading) {
      console.log(`[BATCH-${batchId}] 上傳進行中，忽略重複請求`);
      return;
    }
    
    setUploading(true);
    setUploadTotal(files.length);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`[BATCH-${batchId}] 處理檔案 ${i + 1}/${files.length}: ${file.name}`);
        
        try {
          await uploadFile(file);
          setUploadProgress(i + 1);
          console.log(`[BATCH-${batchId}] 檔案 ${file.name} 上傳完成`);
        } catch (error) {
          console.error(`[BATCH-${batchId}] 上傳檔案 ${file.name} 失敗:`, error);
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
  }, [loadPhotos, uploading]);

  // 使用 ref 來避免 useEffect 依賴問題
  const handleUploadRef = useRef(handleUpload);
  handleUploadRef.current = handleUpload;

  useEffect(() => {
    loadPhotos();
    
    // 監聽上傳事件
    const handleUploadFiles = (event: CustomEvent) => {
      console.log('[EVENT] uploadFiles 事件被觸發', event.detail);
      handleUploadRef.current(event.detail);
    };
    
    console.log('[EVENT] 添加 uploadFiles 事件監聽器');
    window.addEventListener('uploadFiles', handleUploadFiles as EventListener);
    
    return () => {
      console.log('[EVENT] 移除 uploadFiles 事件監聽器');
      window.removeEventListener('uploadFiles', handleUploadFiles as EventListener);
    };
  }, [loadPhotos]);

  // 搜尋功能
  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setFilteredPhotos(photos);
      return;
    }

    const fuse = new Fuse(photos, {
      keys: ['name', 'labels'],
      threshold: 0.4,
    });
    
    const results = fuse.search(query).map((result: any) => result.item);
    setFilteredPhotos(results);
  }, [photos]);

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

  // 打開編輯標籤模態框
  const handleEditLabels = useCallback((photo: Photo) => {
    setEditingPhoto(photo);
    setEditModalOpen(true);
  }, []);

  // 保存標籤更新
  const handleSaveLabels = useCallback(async (photo: Photo, newLabels: string[]) => {
    try {
      const response = await fetch(`/api/photos/${photo.id}/labels`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ labels: newLabels }),
      });

      if (response.ok) {
        // 更新本地狀態
        setPhotos(photos.map(p => 
          p.id === photo.id ? { ...p, labels: newLabels } : p
        ));
        setFilteredPhotos(filteredPhotos.map(p => 
          p.id === photo.id ? { ...p, labels: newLabels } : p
        ));
        console.log('標籤更新成功:', photo.name, newLabels);
      } else {
        console.error('標籤更新失敗');
      }
    } catch (error) {
      console.error('標籤更新失敗:', error);
    }
  }, [photos, filteredPhotos]);

  // 關閉編輯模態框
  const handleCloseEditModal = useCallback(() => {
    setEditModalOpen(false);
    setEditingPhoto(null);
  }, []);

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
    <>
      {/* Desktop Photos Header */}
      <header className="hidden lg:block material-thick sticky top-0 z-40 border-b border-opacity-20" style={{ borderColor: 'var(--separator)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-title-1" style={{ color: 'var(--foreground)' }}>
                照片
              </h1>
              <div 
                className="px-3 py-1 rounded-2xl"
                style={{ 
                  background: 'var(--surface-secondary)',
                  color: 'var(--foreground-secondary)'
                }}
              >
                <span className="text-footnote font-semibold">
                  {filteredPhotos.length} 張照片
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Apple Segmented Control for View Mode */}
              <div 
                className="flex rounded-2xl p-1"
                style={{ background: 'var(--surface-secondary)' }}
              >
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-xl text-callout font-medium transition-all duration-200 ${
                    viewMode === 'grid' ? 'interactive-scale' : ''
                  }`}
                  style={{
                    background: viewMode === 'grid' ? 'var(--surface)' : 'transparent',
                    color: viewMode === 'grid' ? 'var(--foreground)' : 'var(--foreground-secondary)',
                    boxShadow: viewMode === 'grid' ? 'var(--shadow-1)' : 'none'
                  }}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-xl text-callout font-medium transition-all duration-200 ${
                    viewMode === 'list' ? 'interactive-scale' : ''
                  }`}
                  style={{
                    background: viewMode === 'list' ? 'var(--surface)' : 'transparent',
                    color: viewMode === 'list' ? 'var(--foreground)' : 'var(--foreground-secondary)',
                    boxShadow: viewMode === 'list' ? 'var(--shadow-1)' : 'none'
                  }}
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
              </div>

              {/* More Options */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="interactive-scale p-3 rounded-2xl transition-all duration-200"
                style={{ 
                  background: showFilters ? 'var(--accent)' : 'var(--surface-secondary)',
                  color: showFilters ? 'white' : 'var(--foreground-secondary)'
                }}
              >
                <EllipsisHorizontalIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Apple Search Bar */}
          <div className="relative">
            <div 
              className="relative flex items-center rounded-2xl transition-all duration-200"
              style={{ 
                background: 'var(--surface-secondary)',
                border: '0.5px solid var(--separator)'
              }}
            >
              <div className="pl-4">
                <svg 
                  className="w-5 h-5" 
                  style={{ color: 'var(--foreground-tertiary)' }}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2} 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="搜尋照片、標籤..."
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent px-3 py-3 text-body focus:outline-none"
                style={{ 
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-system)'
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Bar */}
      <div className="lg:hidden px-6 py-4" style={{ background: 'var(--background)' }}>
        <div className="relative">
          <div 
            className="relative flex items-center rounded-2xl transition-all duration-200"
            style={{ 
              background: 'var(--surface-secondary)',
              border: '0.5px solid var(--separator)'
            }}
          >
            <div className="pl-4">
              <svg 
                className="w-5 h-5" 
                style={{ color: 'var(--foreground-tertiary)' }}
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="搜尋照片、標籤..."
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 bg-transparent px-3 py-3 text-body focus:outline-none"
              style={{ 
                color: 'var(--foreground)',
                fontFamily: 'var(--font-system)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Apple-style Upload Progress */}
      {uploading && (
        <div className="fixed top-24 left-6 right-6 lg:left-auto lg:right-8 lg:w-80 z-50 animate-spring-up">
          <div className="card-primary p-6 material-thick">
            <div className="flex items-center space-x-4">
              <div 
                className="p-3 rounded-2xl"
                style={{ 
                  background: 'rgba(0, 122, 255, 0.1)',
                  color: 'var(--accent)'
                }}
              >
                <ArrowUpTrayIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-headline" style={{ color: 'var(--foreground)' }}>
                    上傳中...
                  </span>
                  <span className="text-footnote" style={{ color: 'var(--foreground-secondary)' }}>
                    {uploadProgress}/{uploadTotal}
                  </span>
                </div>
                <div 
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ background: 'var(--surface-secondary)' }}
                >
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(uploadProgress / uploadTotal) * 100}%`,
                      background: 'var(--accent)'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apple Photos Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div 
              className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" 
              style={{ borderColor: 'var(--accent)' }}
            ></div>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="card-primary p-12 text-center animate-spring-up">
            <div 
              className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center"
              style={{ background: 'rgba(0, 122, 255, 0.1)' }}
            >
              <svg 
                className="w-12 h-12" 
                style={{ color: 'var(--accent)' }}
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
            <h3 className="text-title-3 mb-3" style={{ color: 'var(--foreground)' }}>
              還沒有照片
            </h3>
            <p className="text-body mb-8" style={{ color: 'var(--foreground-secondary)' }}>
              開始上傳您的第一張照片吧
            </p>
            <label className="btn-primary interactive-scale cursor-pointer">
              <ArrowUpTrayIcon className="w-5 h-5" />
              選擇照片
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  console.log('[DirectUpload] 檔案選擇事件觸發, 檔案數量:', e.target.files?.length);
                  if (e.target.files) {
                    console.log('[DirectUpload] 直接呼叫 handleUpload');
                    handleUpload(e.target.files);
                    // 清空 input value 防止重複觸發
                    e.target.value = '';
                  }
                }}
              />
            </label>
          </div>
        ) : (
          <div className={`
            animate-fade-in
            ${viewMode === 'grid' 
              ? 'grid gap-1 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' 
              : 'space-y-4'
            }
          `}>
            {filteredPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className={`
                  animate-slide-in-right
                  ${viewMode === 'grid' 
                    ? 'aspect-square rounded-2xl overflow-hidden interactive-scale cursor-pointer' 
                    : 'card-primary p-4'
                  }
                `}
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => handlePhotoSelect(photo)}
                suppressHydrationWarning
              >
                <PhotoCard
                  photo={photo}
                  onSelect={handlePhotoSelect}
                  onEditLabels={handleEditLabels}
                  onDelete={handleDelete}
                  onShare={handleShare}
                  isSelected={selectedPhotos.has(photo.id)}
                  selectionMode={selectionMode}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Apple-style Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50">
          <div className="modal-backdrop">
            <Lightbox
              open={lightboxOpen}
              close={() => setLightboxOpen(false)}
              index={currentIndex}
              slides={slides}
              plugins={[Fullscreen, Zoom] as any}
              styles={{
                container: { 
                  backgroundColor: 'transparent',
                  backdropFilter: 'blur(40px)',
                  WebkitBackdropFilter: 'blur(40px)'
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Edit Labels Modal */}
      <EditLabelsModal
        isOpen={editModalOpen}
        photo={editingPhoto}
        onClose={handleCloseEditModal}
        onSave={handleSaveLabels}
      />
    </>
  );
} 