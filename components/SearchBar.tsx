'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ 
  onSearch, 
  placeholder = "搜尋照片、標籤...",
  className = "" 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`relative flex items-center transition-all duration-200 ${
        isFocused 
          ? 'bg-white dark:bg-gray-800 shadow-lg ring-2 ring-blue-500/20' 
          : 'bg-gray-100 dark:bg-gray-800'
      } rounded-xl`}>
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 ml-4" />
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none"
        />
        
        {query && (
          <button
            onClick={handleClear}
            className="mr-3 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <XMarkIcon className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* 搜尋建議 */}
      {isFocused && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-10 max-h-60 overflow-y-auto">
          {/* 這裡可以添加搜尋建議邏輯 */}
          <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
            正在搜尋 "{query}"...
          </div>
        </div>
      )}
    </div>
  );
} 