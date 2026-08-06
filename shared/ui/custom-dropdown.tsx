/**
 * Custom Dropdown Component
 *
 * Purpose: Small reusable dropdown primitive for lightweight header and assistant controls.
 * Used in: model picker and locale switcher.
 * Used for: Provides an app-owned menu when shared Radix dropdown behavior is not desired.
 *
 * Function Index:
 * CustomDropdown: Renders a keyboard-accessible button and option list.
 *
 * Steps:
 * 1. Keep open state local to the dropdown.
 * 2. Close on disabled state, outside pointer down, Escape, or item selection.
 * 3. Position the menu above or below the trigger from the direction prop.
 */

'use client';

import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { KeyboardEvent, ReactNode } from 'react';
import { useEffect, useId, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

export type CustomDropdownDirection = 'up' | 'down';

export type CustomDropdownItem = {
  id: string;
  label: ReactNode;
};

type CustomDropdownProps = {
  ariaLabel: string;
  items: CustomDropdownItem[];
  selectedItemId: string;
  onItemSelect: (itemId: string) => void;
  placeholder?: ReactNode;
  disabled?: boolean;
  direction?: CustomDropdownDirection;
  startIcon?: ReactNode;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  itemClassName?: string;
  selectedItemClassName?: string;
};

/**
 * Renders a compact custom dropdown control.
 *
 * @param props - Item, selection, behavior, and styling configuration.
 * @returns Button trigger with an absolutely positioned option list.
 */
export function CustomDropdown(props: CustomDropdownProps) {
  const {
    ariaLabel,
    items,
    selectedItemId,
    onItemSelect,
    placeholder = 'Select',
    disabled = false,
    direction = 'down',
    startIcon,
    className,
    triggerClassName,
    contentClassName,
    itemClassName,
    selectedItemClassName,
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownId = useId();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedItem = items.find(function findSelectedItem(item) {
    return item.id === selectedItemId;
  });
  const DirectionIcon = direction === 'up' ? ChevronUp : ChevronDown;

  useEffect(function closeDropdownWhenDisabled() {
    if (disabled) {
      setIsOpen(false);
    }
  }, [disabled]);

  useEffect(function closeDropdownOnOutsidePointerDown() {
    function handlePointerDown(event: PointerEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);

    return function cleanupPointerDownListener() {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  function toggleDropdown() {
    if (!disabled) {
      setIsOpen(function getNextOpenState(currentIsOpen) {
        return !currentIsOpen;
      });
    }
  }

  function closeDropdownOnEscape(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }

  function selectItem(itemId: string) {
    onItemSelect(itemId);
    setIsOpen(false);
  }

  return (
    <div className={cn('relative shrink-0', className)} onKeyDown={closeDropdownOnEscape} ref={dropdownRef}>
      <button
        aria-controls={dropdownId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className={cn(
          'flex h-9 min-w-[8.75rem] max-w-[10.5rem] items-center justify-between gap-2 rounded-none bg-background px-3 text-left font-button text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
          triggerClassName,
        )}
        disabled={disabled}
        onClick={toggleDropdown}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-2">
          {startIcon}
          <span className="truncate">{selectedItem?.label ?? placeholder}</span>
        </span>
        <DirectionIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          className={cn(
            'absolute right-0 z-[200] min-w-[10.5rem] rounded-none bg-foreground p-1 text-background shadow-lg ring-1 ring-black/10',
            direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2',
            contentClassName,
          )}
          id={dropdownId}
          role="listbox"
        >
          {items.map(function renderDropdownItem(item) {
            const isSelected = item.id === selectedItemId;

            return (
              <button
                aria-selected={isSelected}
                className={cn(
                  'flex w-full items-center justify-between gap-3 rounded-none px-2 py-2 text-left font-button text-xs text-background transition-colors hover:bg-primary hover:text-foreground focus:bg-primary focus:text-foreground focus:outline-none',
                  itemClassName,
                  isSelected ? selectedItemClassName : undefined,
                )}
                key={item.id}
                onClick={function handleDropdownItemClick() { selectItem(item.id); }}
                role="option"
                type="button"
              >
                <span>{item.label}</span>
                {isSelected ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
