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
      <div 
        className={`relative flex items-center transition-all duration-200 ${
          isFocused ? 'scale-[1.02]' : 'scale-100'
        }`}
        style={{
          background: isFocused ? 'var(--surface)' : 'var(--surface-secondary)',
          border: `0.5px solid ${isFocused ? 'var(--accent)' : 'var(--separator)'}`,
          borderRadius: 'var(--radius-large)',
          boxShadow: isFocused ? 'var(--shadow-2)' : 'var(--shadow-1)'
        }}
      >
        <MagnifyingGlassIcon 
          className="w-5 h-5 ml-4" 
          style={{ color: isFocused ? 'var(--accent)' : 'var(--foreground-tertiary)' }}
        />
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3 py-3 text-body focus:outline-none"
          style={{ 
            color: 'var(--foreground)',
            fontFamily: 'var(--font-system)'
          }}
        />
        
        {query && (
          <button
            onClick={handleClear}
            className="mr-3 p-2 rounded-full interactive-scale transition-all duration-200"
            style={{
              background: 'var(--surface-secondary)',
              color: 'var(--foreground-tertiary)'
            }}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Apple-style Search Suggestions */}
      {isFocused && query && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 z-20 animate-spring-up max-h-60 overflow-y-auto"
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-large)',
            boxShadow: 'var(--shadow-modal)',
            border: '0.5px solid var(--separator)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)'
          }}
        >
          <div className="p-4">
            <div className="flex items-center space-x-3">
              <div 
                className="p-2 rounded-xl"
                style={{ background: 'var(--surface-secondary)' }}
              >
                <MagnifyingGlassIcon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              </div>
              <span className="text-callout" style={{ color: 'var(--foreground-secondary)' }}>
                正在搜尋 &quot;{query}&quot;...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 