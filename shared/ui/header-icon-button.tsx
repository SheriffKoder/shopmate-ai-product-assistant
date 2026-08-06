/**
 * Header Icon Button Component
 * 
 * Purpose: Reusable icon button for header actions
 * Used in: header action buttons and cart dropdown triggers.
 * Used for: Shares a consistent icon button primitive across header islands.
 */

'use client';

import { LucideIcon } from 'lucide-react';

interface HeaderIconButtonProps {
  icon: LucideIcon;
  label?: string;
  onClick?: () => void;
  badgeCount?: number;
  className?: string;
  tooltip?: string;
  isActive?: boolean;
  disabled?: boolean;
  activeClassName?: string;
  inactiveClassName?: string;
}

export const HeaderIconButton = ({
  icon: Icon,
  label,
  onClick,
  badgeCount,
  className = '',
  tooltip,
  isActive = false,
  activeClassName = 'bg-primary text-foreground',
  inactiveClassName = 'bg-background text-foreground',
  disabled = false,
}: HeaderIconButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`header-icon-control cursor-pointer rounded-none
      ${className}
      ${isActive ? activeClassName : inactiveClassName}
      ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      {label ? <span className="font-button hidden md:block">{label}</span> : null}
      <Icon aria-hidden="true" />
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="header-cart-badge bg-primary text-foreground">
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
    </button>
  );
};
