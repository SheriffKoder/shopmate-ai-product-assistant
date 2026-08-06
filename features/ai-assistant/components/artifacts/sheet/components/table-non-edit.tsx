/**
 * Table Component
 * 
 * Purpose: Reusable table component that renders CSV data as HTML table
 * Used in: DocumentContent (preview) and SheetArtifactContent (panel)
 * Why: Single component for both preview and panel, controlled by isPreview prop
 * 
 * Features:
 * - Parses CSV string into rows/columns using papaparse
 * - Renders as HTML table with proper styling
 * - Handles empty cells and rows
 * - Responsive design with overflow handling
 * - isPreview prop controls styling (fixed height vs full height)
 */

'use client';

import { useMemo } from 'react';
import { parse } from 'papaparse';
import { cn } from '@/shared/lib/utils';

interface TableProps {
  /** CSV string to render */
  csvContent: string;
  /** If true, applies preview styling (overflow scroll, fixed height) */
  isPreview?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** If true, shows skeleton table with empty cells during streaming */
  isStreaming?: boolean;
}

/**
 * Table Component
 * 
 * Renders CSV data as an HTML table.
 * Used in both preview card and artifact panel.
 * 
 * @param csvContent - CSV string to render
 * @param isPreview - If true, applies preview styling (overflow scroll, fixed height)
 * @param className - Additional CSS classes
 * @param isStreaming - If true, shows skeleton table with empty cells during streaming
 */
export function Table({ csvContent, isPreview = false, className, isStreaming = false }: TableProps) {
  // Parse CSV into rows and columns using papaparse
  const rows = useMemo(() => {
    if (!csvContent || !csvContent.trim()) {
      return [];
    }

    try {
      // Use papaparse for robust CSV parsing
      // Handles: quotes, escaped quotes, commas in fields, newlines in fields, etc.
      // During streaming, we may have incomplete CSV, so we parse what we have
      const result = parse<string[]>(csvContent, {
        skipEmptyLines: false, // Keep empty rows for table structure
        header: false, // Return as array of arrays (not object with headers)
      });

      return result.data || [];
    } catch (error) {
      // If parsing fails (incomplete CSV during streaming), try to extract at least headers
      // Look for first newline to get header row
      const firstNewlineIndex = csvContent.indexOf('\n');
      if (firstNewlineIndex > 0) {
        const headerLine = csvContent.substring(0, firstNewlineIndex);
        try {
          const headerResult = parse<string[]>(headerLine, {
            skipEmptyLines: false,
            header: false,
          });
          if (headerResult.data && headerResult.data.length > 0) {
            return headerResult.data; // Return just headers if we can't parse the rest
          }
        } catch {
          // Ignore header parsing errors
        }
      }
      console.error('[Table] Error parsing CSV:', error);
      return [];
    }
  }, [csvContent]);

  // First row is header, rest are data rows
  const headerRow = rows[0] || [];
  const dataRows = rows.slice(1);

  // During streaming, always show table (even if no data yet)
  // Use placeholder headers if we don't have real headers yet
  const placeholderHeaders = ['Column 1', 'Column 2', 'Column 3', 'Column 4'];
  const displayHeaders = headerRow.length > 0 ? headerRow : (isStreaming ? placeholderHeaders : []);

  // Determine max columns (use display headers length or max data row length)
  const maxColumns = Math.max(
    displayHeaders.length,
    ...(dataRows.length > 0 ? dataRows.map((row: string[]) => row.length) : [0])
  );

  // Always show skeleton table if:
  // 1. We're streaming AND have no data yet, OR
  // 2. We're streaming AND have headers but no data rows
  // 3. We have no data at all (always show table structure, never "No data available")
  const showSkeleton = isStreaming && (rows.length === 0 || (headerRow.length > 0 && dataRows.length === 0));
  
  // If we have no headers and no data, use placeholder headers to show table structure
  const finalDisplayHeaders = displayHeaders.length > 0 ? displayHeaders : placeholderHeaders;
  const finalMaxColumns = Math.max(
    finalDisplayHeaders.length,
    ...(dataRows.length > 0 ? dataRows.map((row: string[]) => row.length) : [0])
  ) || finalDisplayHeaders.length;

  // If we have headers but no data during streaming, show skeleton rows
  // Also show skeleton if no data at all (to always show table structure)
  const skeletonRowCount = showSkeleton || (rows.length === 0 && !isStreaming) ? 8 : 0;

  return (
    <div
      className={cn(
        'w-full',
        {
          'h-[257px] overflow-auto': isPreview, // Preview: fixed height, scrollable
          'overflow-auto': !isPreview, // Panel: full height, scrollable
        },
        className
      )}
    >
      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        {/* Header Row - Always show if we have headers or placeholders */}
        {finalDisplayHeaders.length > 0 && (
          <thead>
            <tr>
              {Array.from({ length: finalMaxColumns }, (_, index) => (
                <th
                  key={index}
                  className="border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left font-semibold text-sm sticky top-0 z-10"
                >
                  {finalDisplayHeaders[index] || `Column ${index + 1}`}
                </th>
              ))}
            </tr>
          </thead>
        )}

        {/* Data Rows */}
        <tbody>
          {/* Render actual data rows */}
          {dataRows.length > 0 && dataRows.map((row: string[], rowIndex: number) => (
            <tr key={rowIndex}>
              {Array.from({ length: finalMaxColumns }, (_, colIndex) => (
                <td
                  key={colIndex}
                  className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm"
                >
                  {row[colIndex] || ''}
                </td>
              ))}
            </tr>
          ))}
          
          {/* Show skeleton rows during streaming or when no data at all */}
          {skeletonRowCount > 0 && Array.from({ length: skeletonRowCount }, (_, rowIndex) => (
            <tr key={`skeleton-${rowIndex}`}>
              {Array.from({ length: finalMaxColumns }, (_, colIndex) => (
                <td
                  key={colIndex}
                  className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm"
                >
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

