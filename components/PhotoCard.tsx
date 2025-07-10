'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  HeartIcon, 
  ShareIcon, 
  EllipsisHorizontalIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface Photo {
  id: number;
  name: string;
  image_url: string;
  labels: string[];
  isFavorite?: boolean;
}

interface PhotoCardProps {
  photo: Photo;
  onSelect?: (photo: Photo) => void;
  onFavorite?: (photo: Photo) => void;
  onDelete?: (photo: Photo) => void;
  onShare?: (photo: Photo) => void;
  isSelected?: boolean;
  selectionMode?: boolean;
}

export default function PhotoCard({ 
  photo, 
  onSelect, 
  onFavorite, 
  onDelete, 
  onShare,
  isSelected = false,
  selectionMode = false 
}: PhotoCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleCardClick = () => {
    if (selectionMode) {
      onSelect?.(photo);
    } else {
      onSelect?.(photo);
    }
  };

  return (
    <div className={`card relative group overflow-hidden ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      {/* 照片容器 */}
      <div 
        className="relative aspect-square cursor-pointer overflow-hidden"
        onClick={handleCardClick}
      >
        {/* 載入中的佔位符 */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 text-gray-400">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
          </div>
        )}
        
        <Image
          src={photo.image_url}
          alt={photo.name}
          fill
          className={`object-cover transition-all duration-300 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />

        {/* 選擇模式的勾選框 */}
        {selectionMode && (
          <div className="absolute top-2 right-2">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              isSelected 
                ? 'bg-blue-500 border-blue-500' 
                : 'bg-white/80 border-white/80 backdrop-blur-sm'
            }`}>
              {isSelected && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        )}

        {/* 懸停時的操作按鈕 */}
        {!selectionMode && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite?.(photo);
                }}
                className="w-8 h-8 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-black transition-colors"
              >
                {photo.isFavorite ? (
                  <HeartIconSolid className="w-4 h-4 text-red-500" />
                ) : (
                  <HeartIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                )}
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(!showActions);
                }}
                className="w-8 h-8 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-black transition-colors"
              >
                <EllipsisHorizontalIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 照片資訊 */}
      <div className="p-3">
        <h3 className="font-medium text-sm truncate mb-2" title={photo.name}>
          {photo.name}
        </h3>
        
        {/* 標籤 */}
        {photo.labels && photo.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {photo.labels.slice(0, 3).map((label, index) => (
              <span key={index} className="tag text-xs">
                {label}
              </span>
            ))}
            {photo.labels.length > 3 && (
              <span className="tag text-xs">
                +{photo.labels.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 操作選單 */}
      {showActions && (
        <div className="absolute top-12 right-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10 min-w-[120px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare?.(photo);
              setShowActions(false);
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <ShareIcon className="w-4 h-4" />
            分享
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              // 編輯功能
              setShowActions(false);
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <PencilIcon className="w-4 h-4" />
            編輯
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(photo);
              setShowActions(false);
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-500"
          >
            <TrashIcon className="w-4 h-4" />
            刪除
          </button>
        </div>
      )}
    </div>
  );
} 