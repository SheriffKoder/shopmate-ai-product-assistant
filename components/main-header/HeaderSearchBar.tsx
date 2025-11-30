/**
 * Header Search Bar Component
 * 
 * Purpose: Search input for header
 * Used in: main-header.tsx
 * Why: Separates search bar UI logic into a reusable component
 */

'use client';

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface HeaderSearchBarProps {
  onSearch?: (query: string) => void;
  onQueryChange?: (query: string) => void;
  value?: string;
  placeholder?: string;
  className?: string;
}

export const HeaderSearchBar = ({
  onSearch,
  onQueryChange,
  value,
  placeholder = 'Search products...',
  className = '',
}: HeaderSearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState(value || '');

  // Update local state when value prop changes
  React.useEffect(() => {
    if (value !== undefined) {
      setSearchQuery(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    if (onQueryChange) {
      onQueryChange(newQuery);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    if (onQueryChange) {
      onQueryChange('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full flex items-center justify-center px-2 ${className}`}>
      <div className="w-full relative mx-auto max-w-md">
        <input
          type="text"
          value={searchQuery}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full h-full py-2 max-w-md rounded-sm bg-black/10 border-2 border-black/5 text-black/90 
          placeholder:text-black/50 outline-none focus:bg-black/15 
          transition-all duration-300 text-sm ${
            searchQuery.trim() ? 'pl-10 pr-10' : 'pl-10 pr-4'
          }`}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/50" />
        {searchQuery.trim() && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/50 hover:text-black/80 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  );
};

