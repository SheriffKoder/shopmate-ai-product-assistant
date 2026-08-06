/**
 * Cart Header Dropdown
 *
 * Purpose: Owns open/close behavior and composes cart UI pieces for the app header.
 * Used in: widgets/app-header/ui/app-header.tsx
 * Used for: Keeps the interactive cart island inside the cart feature.
 */
'use client';

import { useEffect, useRef, useState } from 'react';

import { HeaderIconButton } from '@/shared/ui/header-icon-button';
import { CartDropdownItems } from './cart-dropdown-items';
import { CartDropdownSummary } from './cart-dropdown-summary';
import type { CartDropdownProps } from './cart-dropdown.types';

export default function CartHeaderDropdown({ icon: Icon, label, items, badgeCount, className = '', activeClassName, inactiveClassName, headerTitle, tooltip, removeItem, decreaseQuantity, increaseQuantity }: CartDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    if (isOpen) document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <HeaderIconButton icon={Icon} label={label} onClick={() => setIsOpen((open) => !open)} badgeCount={badgeCount} className={className} activeClassName={activeClassName} inactiveClassName={inactiveClassName} tooltip={tooltip} isActive={isOpen} />
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[320px] overflow-hidden border border-foreground bg-background shadow-lg">
          {headerTitle && <div className="border-b border-foreground bg-foreground px-4 py-3"><h3 className="text-sm font-semibold text-primary">{headerTitle}</h3></div>}
          <CartDropdownItems items={items} removeItem={removeItem} decreaseQuantity={decreaseQuantity} increaseQuantity={increaseQuantity} />
          <CartDropdownSummary items={items} onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}
