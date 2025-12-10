'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { parse, unparse } from 'papaparse';
import { cn } from '@/lib/utils';
import { AddColumnButton } from './add-column-button';
import { AddRowButton } from './add-row-button';

interface EditableTableProps {
  /** CSV string to render */
  csvContent: string;
  /** Callback when CSV content changes (triggers debounce) */
  onContentChange: (newCsv: string) => void;
  /** Additional CSS classes */
  className?: string;
  /** If true, table is read-only */
  isReadonly?: boolean;
}

/**
 * Editable Table Component
 *
+ * Renders CSV data as an editable HTML table.
 * Allows inline cell editing with automatic CSV serialization.
 *
 * Features:
 * - Click cell to edit
 * - Enter to save, Escape to cancel
 * - Tab to move to next cell
 * - Arrow keys for navigation
 * - Auto-saves changes via onContentChange callback
 */
export function EditableTable({
  csvContent,
  onContentChange,
  className,
  isReadonly = false,
}: EditableTableProps) {
  // Parse CSV into 2D array (rows and columns)
  const [tableData, setTableData] = useState<string[][]>(() => {
    if (!csvContent || !csvContent.trim()) {
      return [['Column 1', 'Column 2', 'Column 3', 'Column 4']]; // Placeholder headers
    }

    try {
      const result = parse<string[]>(csvContent, {
        skipEmptyLines: false,
        header: false,
      });

      return (result.data as unknown as string[][]) || [];
    } catch (error) {
      console.error('[EditableTable] Error parsing CSV:', error);
      return [];
    }
  });

  // Track which cell is being edited
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Track last synced CSV content to prevent infinite loops
  const lastSyncedCsvRef = useRef<string>(csvContent || '');

  // Memoized max columns for consistent table structure
  const maxColumns = useMemo(
    () => Math.max(...tableData.map((row) => row.length), 1),
    [tableData],
  );

  // Sync tableData with csvContent prop (when navigating versions)
  // IMPORTANT: Only sync when csvContent prop changes from outside (version navigation)
  // Do NOT include tableData in dependencies to prevent infinite loops
  useEffect(() => {
    // Skip if csvContent is empty
    if (!csvContent || !csvContent.trim()) {
      return;
    }

    // Only sync if csvContent actually changed from outside (not from our own updates)
    if (lastSyncedCsvRef.current === csvContent) {
      return;
    }

    try {
      const result = parse<string[]>(csvContent, {
        skipEmptyLines: false,
        header: false,
      });

      const newData = (result.data as unknown as string[][]) || [];
      
      // Update tableData and track the synced CSV
      setTableData(newData);
      lastSyncedCsvRef.current = csvContent;
    } catch (error) {
      console.error('[EditableTable] Error syncing CSV:', error);
    }
  }, [csvContent]); // Only depend on csvContent, not tableData

  // Serialize tableData to CSV and trigger onChange
  const serializeAndNotify = useCallback(
    (newData: string[][]) => {
      try {
        const csv = unparse(newData);
        // Update the ref so we don't trigger sync when this CSV comes back as a prop
        lastSyncedCsvRef.current = csv;
        onContentChange(csv);
      } catch (error) {
        console.error('[EditableTable] Error serializing CSV:', error);
      }
    },
    [onContentChange],
  );

  // Start editing a cell
  const startEditing = useCallback(
    (row: number, col: number) => {
      if (isReadonly) return;

      setEditingCell({ row, col });
      setEditValue(tableData[row]?.[col] || '');
    },
    [isReadonly, tableData],
  );

  // Save cell edit (closes edit mode)
  // shouldNotify: whether to trigger debounce (false for navigation/blur)
  const saveCell = useCallback(
    (shouldNotify: boolean = true) => {
      if (!editingCell) return;

      const { row, col } = editingCell;
      const newData = [...tableData];

      // Ensure row exists
      if (!newData[row]) {
        newData[row] = [];
      }

      // Ensure column exists (pad with empty strings if needed)
      const maxCols = Math.max(...newData.map((r) => r.length), col + 1);

      // Pad all rows to maxCols
      newData.forEach((r) => {
        while (r.length < maxCols) {
          r.push('');
        }
      });

      // Update cell value
      newData[row][col] = editValue;

      setTableData(newData);
      setEditingCell(null);

      // Only notify parent (trigger debounce) if shouldNotify is true
      if (shouldNotify) {
        serializeAndNotify(newData);
      }
    },
    [editValue, editingCell, serializeAndNotify, tableData],
  );

  // Cancel cell edit
  const cancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  // Handle input change - updates cell value in real-time and triggers debounce
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setEditValue(newValue);

      if (!editingCell) return;

      const { row, col } = editingCell;
      const newData = [...tableData];

      // Ensure row exists
      if (!newData[row]) {
        newData[row] = [];
      }

      // Ensure column exists (pad with empty strings if needed)
      const maxCols = Math.max(...newData.map((r) => r.length), col + 1);

      // Pad all rows to maxCols
      newData.forEach((r) => {
        while (r.length < maxCols) {
          r.push('');
        }
      });

      // Update cell value immediately
      newData[row][col] = newValue;

      setTableData(newData);

      // Trigger debounce on every keystroke
      serializeAndNotify(newData);
    },
    [editingCell, serializeAndNotify, tableData],
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!editingCell) return;

      const { row, col } = editingCell;
      const maxRows = tableData.length;
      const maxCols = Math.max(...tableData.map((r) => r.length));

      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          saveCell(false); // Save but don't trigger debounce (navigation)
          // Move to cell below (or next row if at end)
          if (row + 1 < maxRows) {
            setTimeout(() => startEditing(row + 1, col), 0);
          }
          break;

        case 'Escape':
          e.preventDefault();
          cancelEdit();
          break;

        case 'Tab':
          e.preventDefault();
          saveCell(false); // Save but don't trigger debounce (navigation)
          // Move to next cell (or next row if at end of row)
          if (col + 1 < maxCols) {
            setTimeout(() => startEditing(row, col + 1), 0);
          } else if (row + 1 < maxRows) {
            setTimeout(() => startEditing(row + 1, 0), 0);
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          saveCell(false); // Save but don't trigger debounce (navigation)
          if (row > 0) {
            setTimeout(() => startEditing(row - 1, col), 0);
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          saveCell(false); // Save but don't trigger debounce (navigation)
          if (row + 1 < maxRows) {
            setTimeout(() => startEditing(row + 1, col), 0);
          }
          break;

        case 'ArrowLeft':
          // The ArrowLeft key navigates to the previous cell only when:
          // The cursor is at the start of the input value
          // There's a previous column available
          if (inputRef.current) {
            const cursorPos = inputRef.current.selectionStart || 0;
            // Only navigate if cursor is at the start of the input
            if (cursorPos === 0 && col > 0) {
              e.preventDefault();
              saveCell(false); 
              setTimeout(() => startEditing(row, col - 1), 0);
            }
          }
          break;

        case 'ArrowRight':
          // The ArrowRight key navigates to the next cell only when:
          // The cursor is at the end of the input value
          // There's a next column available
          if (inputRef.current) {
            const cursorPos = inputRef.current.selectionStart || 0;
            const valueLength = inputRef.current.value.length;
            // Only navigate if cursor is at the end of the input
            if (cursorPos === valueLength && col + 1 < maxCols) {
              e.preventDefault();
              saveCell(false); // Save but don't trigger debounce (navigation)
              setTimeout(() => startEditing(row, col + 1), 0);
            }
          }
          break;
      }
    },
    [cancelEdit, editingCell, saveCell, startEditing, tableData],
  );

  // Focus input when entering edit mode
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  // Handle adding a new column
  const handleAddColumn = useCallback(() => {
    if (isReadonly) return;

    const newData = tableData.map((row) => {
      const newRow = [...row];
      // Add empty cell at the end
      newRow.push('');
      return newRow;
    });

    setTableData(newData);
    serializeAndNotify(newData);
  }, [tableData, isReadonly, serializeAndNotify]);

  // Handle adding a new row
  const handleAddRow = useCallback(() => {
    if (isReadonly) return;

    const newData = [...tableData];
    // Create a new row with the same number of columns as the header
    const newRow = Array(maxColumns).fill('');
    newData.push(newRow);

    setTableData(newData);
    serializeAndNotify(newData);
  }, [tableData, maxColumns, isReadonly, serializeAndNotify]);

  // Header row (first row) and data rows
  const headerRow = tableData[0] || [];
  const dataRows = tableData.slice(1);

  return (
    <div className={cn('w-full overflow-auto', className)}>
      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        {/* Header Row */}
        {headerRow.length > 0 && (
          <thead>
            <tr>
              {Array.from({ length: maxColumns }, (_, index) => {
                const isLastColumn = index === maxColumns - 1;
                return (
                  <th
                    key={index}
                    className={cn(
                      'border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left font-semibold text-sm sticky top-0 z-10',
                      isLastColumn && !isReadonly && 'group relative'
                    )}
                  >
                    {headerRow[index] || `Column ${index + 1}`}
                    {/* Add Column Button - Top center of last header cell */}
                    {isLastColumn && !isReadonly && (
                      <AddColumnButton
                        onAddColumn={handleAddColumn}
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
        )}

        {/* Data Rows */}
        <tbody>
          {dataRows.map((row, rowIndex) => {
            const isLastRow = rowIndex === dataRows.length - 1;
            return (
              <tr key={rowIndex}>
                {Array.from({ length: maxColumns }, (_, colIndex) => {
                  const cellValue = row[colIndex] || '';
                  const isEditing = editingCell?.row === rowIndex + 1 && editingCell?.col === colIndex;
                  const isFirstColumn = colIndex === 0;

                  return (
                    <td
                      key={colIndex}
                      className={cn(
                        'border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm relative',
                        {
                          'bg-blue-50 dark:bg-blue-900/20': isEditing,
                          'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50':
                            !isReadonly && !isEditing,
                          'group': isFirstColumn && isLastRow && !isReadonly,
                        },
                      )}
                      onClick={() => !isReadonly && startEditing(rowIndex + 1, colIndex)}
                    >
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          type="text"
                          value={editValue}
                          onChange={handleInputChange}
                          onBlur={() => saveCell(false)} // Save but don't trigger debounce (blur)
                          onKeyDown={handleKeyDown}
                          className="w-full bg-transparent border-none outline-none text-sm"
                          autoFocus
                        />
                      ) : (
                        <span className="block min-h-[1.5rem]">
                          {cellValue || <span className="text-muted-foreground opacity-50">—</span>}
                        </span>
                      )}
                      {/* Add Row Button - Bottom center of last cell in first column */}
                      {isFirstColumn && isLastRow && !isReadonly && (
                        <AddRowButton
                          onAddRow={handleAddRow}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

