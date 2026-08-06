/**
 * Header Search Bar Component
 * 
 * Purpose: Search input for header
 * Used in: widgets/app-header/ui/app-header.tsx
 * Used for: Keeps header product search UI inside the header-search feature.
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
  React.useEffect(function syncControlledSearchValue() {
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
          className={`h-10 w-full max-w-md bg-foreground/5 py-2 font-button placeholder:font-button text-sm text-foreground border border-transparent rounded
          placeholder:text-foreground/50 outline-none transition-colors duration-150 focus:bg-primary/20 focus:border focus:border-foreground/20 ${
            searchQuery.trim() ? 'pl-10 pr-10' : 'pl-10 pr-4'
          }`}
        />
        <Search aria-hidden="true" className="absolute left-3 top-1/2 size-5 -translate-y-1/2 stroke-2 text-foreground" />
        {searchQuery.trim() && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-foreground transition-colors hover:text-primary"
            aria-label="Clear search"
          >
            <X aria-hidden="true" className="size-5 stroke-2" />
          </button>
        )}
      </div>
    </form>
  );
};
