/**
 * Categories Header Component
 * 
 * Purpose: Displays the header for categories section
 * Used in: HeaderCategories.tsx
 * Why: Separates header UI logic into a reusable component
 */

'use client';

import React from 'react';

interface CategoriesHeaderProps {
  title?: string;
  className?: string;
}

export const CategoriesHeader = ({ 
  title = 'Categories',
  className = '' 
}: CategoriesHeaderProps) => {
  return (
    <h2 className={`text-2xl font-extrabold
    bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text ${className}`}>
      {title}
    </h2>
  );
};

