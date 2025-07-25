'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  ShareIcon, 
  EllipsisHorizontalIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

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
  onDelete?: (photo: Photo) => void;
  onShare?: (photo: Photo) => void;
  onEditLabels?: (photo: Photo) => void;
  isSelected?: boolean;
  selectionMode?: boolean;
}

export default function PhotoCard({ 
  photo, 
  onSelect, 
  onDelete, 
  onShare,
  onEditLabels,
  isSelected = false,
  selectionMode = false 
}: PhotoCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showAllLabels, setShowAllLabels] = useState(false);

  const handleCardClick = () => {
    if (selectionMode) {
      onSelect?.(photo);
    } else {
      onSelect?.(photo);
    }
  };

  return (
    <div className={`
      relative group cursor-pointer transition-all duration-200
      ${isSelected ? 'scale-95' : 'hover:scale-[1.02]'}
    `}>
      {/* Apple Photos-style Image Container */}
      <div 
        className={`
          relative w-full aspect-square overflow-hidden transition-all duration-300
          ${isSelected 
            ? 'rounded-2xl ring-3 ring-offset-2' 
            : 'rounded-xl group-hover:rounded-2xl'
          }
        `}
        style={{ 
          '--tw-ring-color': isSelected ? 'var(--accent)' : 'transparent',
          '--tw-ring-offset-color': 'var(--background)'
        } as React.CSSProperties}
        onClick={handleCardClick}
      >
        {/* Loading Placeholder */}
        {!imageLoaded && (
          <div 
            className="absolute inset-0 animate-pulse flex items-center justify-center"
            style={{ background: 'var(--surface-secondary)' }}
          >
            <div className="w-8 h-8" style={{ color: 'var(--foreground-tertiary)' }}>
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
          className={`object-cover transition-all duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />

        {/* Selection Mode Checkmark */}
        {selectionMode && (
          <div className="absolute top-3 right-3">
            <div 
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                isSelected 
                  ? 'scale-110' 
                  : 'scale-100'
              }`}
              style={{
                background: isSelected ? 'var(--accent)' : 'rgba(255, 255, 255, 0.9)',
                borderColor: isSelected ? 'var(--accent)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)'
              }}
            >
              {isSelected && (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        )}

        {/* Apple-style Hover Actions */}
        {!selectionMode && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300">
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(!showActions);
                }}
                className="interactive-scale w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-200"
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)'
                }}
              >
                <EllipsisHorizontalIcon className="w-5 h-5 text-black" />
              </button>
            </div>
          </div>
        )}

        {/* Apple Photos-style Gradient Overlay for Labels */}
        {photo.labels && photo.labels.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
            <div className="flex flex-wrap gap-1">
              {(showAllLabels ? photo.labels : photo.labels.slice(0, 2)).map((label, index) => (
                <span 
                  key={index} 
                  className="text-caption-1 font-medium px-2 py-1 rounded-lg cursor-pointer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllLabels(!showAllLabels);
                  }}
                >
                  {label}
                </span>
              ))}
              {!showAllLabels && photo.labels.length > 2 && (
                <span 
                  className="text-caption-1 font-medium px-2 py-1 rounded-lg cursor-pointer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllLabels(true);
                  }}
                >
                  +{photo.labels.length - 2}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Apple-style Action Menu */}
      {showActions && (
        <div 
          className="absolute top-16 right-3 z-20 animate-spring-up"
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-large)',
            boxShadow: 'var(--shadow-modal)',
            border: '0.5px solid var(--separator)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)'
          }}
        >
          <div className="py-2 min-w-[140px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare?.(photo);
                setShowActions(false);
              }}
              className="w-full px-4 py-3 text-left text-callout font-medium transition-all duration-200 flex items-center space-x-3 hover:opacity-80"
              style={{ color: 'var(--foreground)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <ShareIcon className="w-5 h-5" />
              <span>分享</span>
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditLabels?.(photo);
                setShowActions(false);
              }}
              className="w-full px-4 py-3 text-left text-callout font-medium transition-all duration-200 flex items-center space-x-3 hover:opacity-80"
              style={{ color: 'var(--foreground)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <PencilIcon className="w-5 h-5" />
              <span>編輯標籤</span>
            </button>
            
            <div className="my-1 border-t" style={{ borderColor: 'var(--separator)' }}></div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(photo);
                setShowActions(false);
              }}
              className="w-full px-4 py-3 text-left text-callout font-medium transition-all duration-200 flex items-center space-x-3"
              style={{ color: 'var(--destructive)' }}
            >
              <TrashIcon className="w-5 h-5" />
              <span>刪除</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 