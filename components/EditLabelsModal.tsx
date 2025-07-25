'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Photo {
  id: number;
  name: string;
  image_url: string;
  labels: string[];
}

interface EditLabelsModalProps {
  isOpen: boolean;
  photo: Photo | null;
  onClose: () => void;
  onSave: (photo: Photo, newLabels: string[]) => void;
}

export default function EditLabelsModal({ 
  isOpen,
  photo, 
  onClose, 
  onSave 
}: EditLabelsModalProps) {
  const [editingLabels, setEditingLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState('');

  // 當 photo 或 modal 打開時更新編輯標籤
  useEffect(() => {
    if (isOpen && photo) {
      setEditingLabels([...photo.labels]);
      setNewLabel('');
    }
  }, [isOpen, photo]);

  // 處理模態框關閉
  const handleClose = () => {
    setNewLabel('');
    onClose();
  };

  // 處理保存
  const handleSave = () => {
    if (photo) {
      onSave(photo, editingLabels);
      handleClose();
    }
  };

  // 添加新標籤
  const addLabel = () => {
    if (newLabel.trim() && !editingLabels.includes(newLabel.trim())) {
      setEditingLabels([...editingLabels, newLabel.trim()]);
      setNewLabel('');
    }
  };

  // 移除標籤
  const removeLabel = (index: number) => {
    setEditingLabels(editingLabels.filter((_, i) => i !== index));
  };

  // 處理 Enter 鍵
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addLabel();
    }
  };

  if (!isOpen || !photo) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4" 
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-md mx-auto animate-spring-up"
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-large)',
          boxShadow: 'var(--shadow-modal)',
          border: '0.5px solid var(--separator)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--separator)' }}>
          <div>
            <h3 className="text-title-3 font-semibold" style={{ color: 'var(--foreground)' }}>
              編輯標籤
            </h3>
            <p className="text-caption-1 mt-1" style={{ color: 'var(--foreground-secondary)' }}>
              {photo.name}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:opacity-80"
            style={{ background: 'var(--surface-secondary)' }}
          >
            <XMarkIcon className="w-5 h-5" style={{ color: 'var(--foreground-secondary)' }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Labels */}
          <div className="mb-6">
            <h4 className="text-callout font-medium mb-3" style={{ color: 'var(--foreground)' }}>
              當前標籤
            </h4>
            <div className="flex flex-wrap gap-2 min-h-[40px]">
              {editingLabels.length > 0 ? (
                editingLabels.map((label, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-2 px-3 py-2 rounded-lg group transition-all duration-200" 
                    style={{ background: 'var(--surface-secondary)' }}
                  >
                    <span className="text-callout" style={{ color: 'var(--foreground)' }}>
                      {label}
                    </span>
                    <button
                      onClick={() => removeLabel(index)}
                      className="w-4 h-4 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-100 transition-all duration-200"
                      style={{ background: 'var(--surface-tertiary)' }}
                    >
                      <XMarkIcon className="w-3 h-3" style={{ color: 'var(--foreground)' }} />
                    </button>
                  </div>
                ))
              ) : (
                <div 
                  className="flex items-center justify-center w-full py-4 rounded-lg border-2 border-dashed"
                  style={{ 
                    borderColor: 'var(--separator)',
                    color: 'var(--foreground-tertiary)'
                  }}
                >
                  <span className="text-callout">目前沒有標籤</span>
                </div>
              )}
            </div>
          </div>

          {/* Add New Label */}
          <div className="mb-6">
            <h4 className="text-callout font-medium mb-3" style={{ color: 'var(--foreground)' }}>
              添加標籤
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="輸入新標籤"
                className="flex-1 px-4 py-3 rounded-xl border-0 outline-none text-callout transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  background: 'var(--surface-secondary)',
                  color: 'var(--foreground)',
                  '--tw-ring-color': 'var(--accent)'
                } as React.CSSProperties}
              />
              <button
                onClick={addLabel}
                disabled={!newLabel.trim() || editingLabels.includes(newLabel.trim())}
                className="px-6 py-3 rounded-xl text-callout font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  background: 'var(--accent)',
                  color: 'white'
                }}
              >
                添加
              </button>
            </div>
            {newLabel.trim() && editingLabels.includes(newLabel.trim()) && (
              <p className="text-caption-2 mt-2" style={{ color: 'var(--destructive)' }}>
                標籤已存在
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 py-3 rounded-xl text-callout font-medium transition-all duration-200 hover:opacity-80"
              style={{ 
                background: 'var(--surface-secondary)',
                color: 'var(--foreground)'
              }}
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-xl text-callout font-medium transition-all duration-200 hover:opacity-90"
              style={{ 
                background: 'var(--accent)',
                color: 'white'
              }}
            >
              保存 ({editingLabels.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}