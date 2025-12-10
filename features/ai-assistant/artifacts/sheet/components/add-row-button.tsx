/**
 * Add Row Button Component
 * 
 * Purpose: Pure reusable button component for adding a new row to a table
 * Used in: EditableTable component
 * Why: Provides a clean, reusable way to add rows with consistent styling
 * 
 * Features:
 * - Positioned at bottom center of the last cell in the first column
 * - Shows on hover
 * - Triggers onAddRow callback
 */

'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddRowButtonProps {
  /** Callback when button is clicked */
  onAddRow: () => void;
  /** Optional className */
  className?: string;
  /** Whether the button is visible (for hover states) */
  isVisible?: boolean;
}

/**
 * Add Row Button Component
 * 
 * Pure component that renders a button for adding a new row.
 * Typically positioned at the bottom center of the last cell in the first column.
 * 
 * @param onAddRow - Callback when button is clicked
 * @param className - Optional additional CSS classes
 * @param isVisible - Whether the button should be visible (default: true)
 * 
 * @example
 * ```typescript
 * <AddRowButton
 *   onAddRow={() => handleAddRow()}
 *   isVisible={isHovering}
 * />
 * ```
 */
export function AddRowButton({
  onAddRow,
  className,
  isVisible = true,
}: AddRowButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onAddRow}
      className={cn(
        'absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 h-6 w-6 rounded-full',
        'bg-background border border-border shadow-sm',
        'hover:bg-accent hover:border-accent-foreground/20',
        'transition-opacity duration-200',
        !isVisible && 'opacity-0 pointer-events-none',
        className
      )}
      aria-label="Add row"
      title="Add row"
    >
      <Plus size={12} />
    </Button>
  );
}

