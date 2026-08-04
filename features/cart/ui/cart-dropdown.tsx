/** Cart header dropdown: owns open/close behavior and composes cart UI pieces. */
'use client';

import { useEffect, useRef, useState } from 'react';
import { HeaderIconButton } from '@/components/main-header/HeaderIconButton';
import { CartDropdownItems } from './cart-dropdown-items';
import { CartDropdownSummary } from './cart-dropdown-summary';
import type { CartDropdownProps } from './cart-dropdown.types';

export default function CartDropdown({ icon: Icon, items, badgeCount, className = '', headerTitle, tooltip, removeItem, decreaseQuantity, increaseQuantity }: CartDropdownProps) {
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
      <HeaderIconButton icon={Icon} onClick={() => setIsOpen((open) => !open)} badgeCount={badgeCount} className={className} tooltip={tooltip} isActive={isOpen} />
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[320px] bg-[#191919]/20 backdrop-blur-xl rounded-lg border border-white/20 shadow-lg z-50 overflow-hidden">
          {headerTitle && <div className="px-4 py-3 border-b border-white/10 bg-gradient-to-r from-primary to-secondary"><h3 className="text-sm font-semibold text-white">{headerTitle}</h3></div>}
          <CartDropdownItems items={items} removeItem={removeItem} decreaseQuantity={decreaseQuantity} increaseQuantity={increaseQuantity} />
          <CartDropdownSummary items={items} onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}
