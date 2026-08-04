/**
 * Add Column Button Component
 * 
 * Purpose: Pure reusable button component for adding a new column to a table
 * Used in: EditableTable component
 * Why: Provides a clean, reusable way to add columns with consistent styling
 * 
 * Features:
 * - Positioned at top center of the last header cell
 * - Shows on hover
 * - Triggers onAddColumn callback
 */

'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddColumnButtonProps {
  /** Callback when button is clicked */
  onAddColumn: () => void;
  /** Optional className */
  className?: string;
  /** Whether the button is visible (for hover states) */
  isVisible?: boolean;
}

/**
 * Add Column Button Component
 * 
 * Pure component that renders a button for adding a new column.
 * Typically positioned at the top center of the last header cell.
 * 
 * @param onAddColumn - Callback when button is clicked
 * @param className - Optional additional CSS classes
 * @param isVisible - Whether the button should be visible (default: true)
 * 
 * @example
 * ```typescript
 * <AddColumnButton
 *   onAddColumn={() => handleAddColumn()}
 *   isVisible={isHovering}
 * />
 * ```
 */
export function AddColumnButton({
  onAddColumn,
  className,
  isVisible = true,
}: AddColumnButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onAddColumn}
      className={cn(
        'absolute -top-3 left-1/2 -translate-x-1/2 z-20 h-6 w-6 rounded-full',
        'bg-background border border-border shadow-sm',
        'hover:bg-accent hover:border-accent-foreground/20',
        'transition-opacity duration-200',
        !isVisible && 'opacity-0 pointer-events-none',
        className
      )}
      aria-label="Add column"
      title="Add column"
    >
      <Plus size={12} />
    </Button>
  );
}

