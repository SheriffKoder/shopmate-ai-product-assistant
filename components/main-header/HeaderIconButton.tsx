/**
 * Header Icon Button Component
 * 
 * Purpose: Reusable icon button for header actions
 * Used in: ButtonDropdown.tsx, main-header.tsx
 * Why: Separates button UI logic into a reusable component
 */

'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface HeaderIconButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  badgeCount?: number;
  className?: string;
  tooltip?: string;
  isActive?: boolean;
}

export const HeaderIconButton = ({
  icon: Icon,
  onClick,
  badgeCount,
  className = '',
  tooltip,
  isActive = false,
}: HeaderIconButtonProps) => {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`h-full px-3 py-2 rounded-sm cursor-pointer
      transition-all duration-300 text-md relative ${className}
      ${isActive ? 'bg-black/10 text-primary' : 'bg-black/10 text-black/90'}`}
    >
      <Icon className="w-5 h-5 stroke-2" />
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
    </button>
  );
};

