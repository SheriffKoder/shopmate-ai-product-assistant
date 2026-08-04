/**
 * Chart Renderer Component
 * 
 * Purpose: Reusable chart component that renders LineChart from JSON data with theme-aware styling
 * Used in: Preview card and artifact panel
 * Why: Provides consistent chart rendering with theme-aware colors
 * 
 * Features:
 * - Parses JSON string into chart data (data only, no styling)
 * - Applies theme-aware styling using foreground colors
 * - Renders using existing LineChart component
 * - Handles invalid JSON gracefully
 * - Responsive design
 * - isPreview prop to control sizing (preview vs. panel)
 */

'use client';

import { useMemo, useEffect, useState } from 'react';
import { LineChart } from '@/components/line-chart/LineChart';
import { cn } from '@/lib/utils';

interface ChartRendererProps {
  jsonContent: string;
  isPreview?: boolean; // If true, applies preview styling (smaller height)
  className?: string;
}

/**
 * Chart Renderer Component
 * 
 * Renders a line chart from JSON data with theme-aware styling.
 * Used in both preview card and artifact panel.
 * 
 * @param jsonContent - JSON string containing chart data (data only, no styling)
 * @param isPreview - If true, applies preview styling (smaller height)
 * @param className - Additional CSS classes
 */
export function ChartRenderer({ jsonContent, isPreview = false, className }: ChartRendererProps) {
  // Get theme-aware foreground color from CSS variables
  // Use getComputedStyle to get the actual computed color value that works with Chart.js
  const [foregroundColor, setForegroundColor] = useState<string>('#000000'); // Visible fallback for dark assistant surfaces

  useEffect(() => {
    // Function to update foreground color from CSS variable
    const updateForegroundColor = () => {
      try {
        // Create a temporary element to get the computed color
        const tempEl = document.createElement('div');
        tempEl.style.color = 'hsl(var(--foreground))';
        document.body.appendChild(tempEl);
        const computedColor = getComputedStyle(tempEl).color;
        document.body.removeChild(tempEl);
        
        if (computedColor && computedColor !== 'rgb(0, 0, 0)') {
          setForegroundColor(computedColor);
        }
      } catch (error) {
        console.warn('[Chart Renderer] Could not get foreground color, using fallback', error);
      }
    };

    // Update color on mount and when theme changes
    updateForegroundColor();

    // Listen for theme changes (class changes on html element)
    const observer = new MutationObserver(() => {
      updateForegroundColor();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Parse JSON into chart data
  const chartData = useMemo(() => {
    if (!jsonContent || !jsonContent.trim()) {
      return null;
    }

    try {
      const parsed = JSON.parse(jsonContent);
      
      // Validate required fields
      if (!parsed.datasets || !Array.isArray(parsed.datasets) || parsed.datasets.length === 0) {
        console.warn('[Chart Renderer] Invalid chart data: missing or empty datasets');
        return null;
      }
      
      if (!parsed.labels || !Array.isArray(parsed.labels) || parsed.labels.length === 0) {
        console.warn('[Chart Renderer] Invalid chart data: missing or empty labels');
        return null;
      }
      
      return parsed;
    } catch (error) {
      console.error('[Chart Renderer] Error parsing JSON:', error);
      return null;
    }
  }, [jsonContent]);

  if (!chartData) {
    return (
      <div className={cn('flex items-center justify-center p-8 text-muted-foreground', className)}>
        <p>Generating data...</p>
      </div>
    );
  }

  // Apply styling in code - use theme-aware foreground color
  // Map datasets to include styling props
  const styledDatasets = chartData.datasets.map((dataset: any) => ({
    ...dataset,
    // Apply theme-aware colors
    lineColor: foregroundColor,
    fillColor: foregroundColor,
    shadowColor: foregroundColor,
    // Default styling values
    fill: true,
    fillOpacity: 0.2,
    showPoints: false,
  }));

  // Determine Y-axis title from dataset labels
  // Use the first dataset label, or a default based on context
  const yAxisTitle = chartData.datasets.length > 0 && chartData.datasets[0].label
    ? chartData.datasets[0].label
    : 'Value';

  // Extract Y-axis scale from chart data (set in Phase 1)
  const yAxisMin = chartData.yAxisMin;
  const yAxisMax = chartData.yAxisMax;

  return (
    <div
      className={cn(
        'w-full',
        {
          'h-[257px]': isPreview, // Preview: fixed height
          'h-full': !isPreview, // Panel: full height
        },
        className
      )}
    >
      <LineChart
        datasets={styledDatasets}
        labels={chartData.labels}
        height={isPreview ? 257 : '100%'}
        // Apply theme-aware styling
        lineColor={foregroundColor}
        shadowColor={foregroundColor}
        labelColor={foregroundColor}
        tickColor={foregroundColor}
        titleColor={foregroundColor}
        subtitleColor={foregroundColor}
        fillColor={foregroundColor}
        // Tooltip colors - use theme-aware foreground color
        tooltipTitleColor={foregroundColor}
        tooltipLabelColor={foregroundColor}
        tooltipBackgroundColor="rgba(0, 0, 0, 0.8)"
        // Y-axis title from dataset label
        yAxisTitle={yAxisTitle}
        // Y-axis scale (calculated from actual data in Phase 1)
        yAxisMin={yAxisMin}
        yAxisMax={yAxisMax}
        // Default styling values
        showNeonShadow={false}
        showGrid={false}
        showXAxisLine={false}
        showYAxisLine={false}
        showLabel={false}
        showTooltip={true}
        lineTension={0.4}
        lineWidth={2}
        showTicks={true}
        showPoints={false}
        fill={true}
        fillOpacity={0.2}
        gradientToTransparent={true}
        gradientStopPercentage={1.0}
        showXGrid={false}
        showYGrid={false}
      />
    </div>
  );
}
