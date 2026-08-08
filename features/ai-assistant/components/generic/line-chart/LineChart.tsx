/**
 * LineChart Component
 * The component is designed to work with minimal configuration while still offering deep customization when needed.
 * 
 * npm install chart.js react-chartjs-2
 * 
 * This component renders a beautiful line chart with the following features:
 * - Smooth curved line with customizable tension
 * - Gradient background fill that fades to transparent
 * - Glowing line effect that matches the theme's primary color
 * - Responsive design that adapts to container size
 * - Hidden data points for a cleaner look
 * - Hidden axis lines for a minimal design
 * - Theme-aware colors that update when the theme changes
 * 
 * Implementation Steps:
 * 1. Set up Chart.js with necessary modules
 * 2. Initialize state and refs for chart data and theme colors
 * 3. Detect and apply theme colors from CSS variables
 * 4. Override the canvas context's stroke method to add glow
 * 5. Configure chart data with gradient background
 *    - Convert hex/named colors to RGBA for opacity support
 *    - Create gradient with configurable stop position
 * 6. Set up chart options for minimal, clean design
 * 7. Render the chart with loading state handling
 */

"use client";
// npm install chart.js react-chartjs-2 chartjs-plugin-datalabels
import React, { useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';

//////////////////////////////////////////////////////////
// 1. CHART.JS SETUP
//////////////////////////////////////////////////////////

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
);

// Define a type for individual datasets
interface DataSet {
  data: number[];
  label?: string;
  lineColor?: string;
  fillColor?: string;
  showPoints?: boolean;
  pointRadius?: number;
  pointColor?: string;
  pointBorderColor?: string;
  fill?: boolean;
  fillOpacity?: number;
  // Add shadow color for each dataset
  shadowColor?: string;
}

interface LineChartProps {
  // Replace single data array with datasets array
  datasets?: DataSet[];
  // Keep labels as a single array since x-axis is shared
  labels?: string[];
  height?: number | string;
  // New styling props
  showNeonShadow?: boolean;
  showGrid?: boolean;
  showXAxisLine?: boolean;
  showYAxisLine?: boolean;
  showLabel?: boolean;
  shadowColor?: string;
  labelColor?: string;
  tickColor?: string;
  chartTitle?: string;
  chartSubtitle?: string;
  showTooltip?: boolean;
  lineTension?: number;
  lineWidth?: number;
  // New props for ticks and points
  showTicks?: boolean;
  showPoints?: boolean;
  pointRadius?: number;
  pointColor?: string;
  pointBorderColor?: string;
  pointBorderWidth?: number;
  // New props for title and subtitle visibility
  showTitle?: boolean;
  showSubtitle?: boolean;
  titleColor?: string;
  subtitleColor?: string;
  // New fill and gradient props
  fill?: boolean;
  fillOpacity?: number;
  gradientToTransparent?: boolean;
  // New gradient control prop
  gradientStopPercentage?: number;
  // New grid control props
  showXGrid?: boolean;
  showYGrid?: boolean;
  gridColor?: string;
  // New font size props
  tickFontSize?: number;
  titleFontSize?: number;
  subtitleFontSize?: number;
  fillColor?: string;
  lineColor?: string;
  // New tooltip styling props
  tooltipBackgroundColor?: string;
  tooltipPadding?: number;
  tooltipTitleColor?: string;
  tooltipLabelColor?: string; // Color for tooltip label text (e.g., "RTC Payment")
  tooltipBodyFont?: number;
  tooltipTitleFont?: number;
  tooltipUseLineColors?: boolean;
  shadowOpacity?: number;
  // Y-axis title prop
  yAxisTitle?: string;
  // Y-axis scale props
  yAxisMin?: number;
  yAxisMax?: number;
}

export const LineChart = ({ 
  // Default to a single dataset if none provided
  datasets = [{ 
    data: [18, 25, 15, 35, 22, 28, 20, 30, 25, 40],
    label: 'Sales'
  }],
  labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  height = '100%',
  // Default values for styling props with white as default
  showNeonShadow = true,
  showGrid = false,
  showXAxisLine = false,
  showYAxisLine = false,
  showLabel = false,
  lineColor = '#000000',
  shadowColor = '#000000',
  labelColor = 'rgba(255, 255, 255, 0.7)',
  tickColor = 'rgba(255, 255, 255, 0.7)',
  chartTitle = 'Sales',
  chartSubtitle = '4 months',
  showTooltip = true,
  lineTension = 0.4,
  lineWidth = 2,
  showTicks = true,
  showPoints = false,
  pointRadius = 3,
  pointColor = '#ffffff',
  pointBorderColor = '#ffffff',
  pointBorderWidth = 1,
  showTitle = true,
  showSubtitle = true,
  titleColor = '#ffffff',
  subtitleColor = 'rgba(255, 255, 255, 0.7)',
  // Default values for new fill and gradient props
  fill = true,
  fillOpacity = 0.5,
  gradientToTransparent = true,
  // Default value for new gradient control prop
  gradientStopPercentage = 1.0,
  // Default values for new grid control props
  showXGrid,
  showYGrid,
  gridColor = 'rgba(255, 255, 255, 0.1)',
  // Default values for new font size props
  tickFontSize = 10,
  titleFontSize = 16,
  subtitleFontSize = 14,
  fillColor,
  // Default values for new tooltip props
  tooltipBackgroundColor = 'rgba(0, 0, 0, 0.7)',
  tooltipPadding = 10,
  tooltipTitleColor = '#ffffff',
  tooltipLabelColor = '#ffffff', // Default label text color
  tooltipBodyFont = 12,
  tooltipTitleFont = 12,
  tooltipUseLineColors = true,
  shadowOpacity = 0.5,
  yAxisTitle,
  yAxisMin,
  yAxisMax
}: LineChartProps) => {
  
  //////////////////////////////////////////////////////////
  // 2. STATE AND REFS INITIALIZATION
  //////////////////////////////////////////////////////////
  
  const chartRef = useRef<ChartJS>(null);
  const [isMounted, setIsMounted] = useState(false);
  const originalStrokeRef = useRef<any>(null);

  // Store dataset shadow colors in a ref to access them in the effect
  const datasetShadowColorsRef = useRef<string[]>([]);

  // Store dataset colors in a ref to access them in tooltip callbacks
  const datasetColorsRef = useRef<string[]>([]);

  //////////////////////////////////////////////////////////
  // 3. THEME COLOR DETECTION
  //////////////////////////////////////////////////////////
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  //////////////////////////////////////////////////////////
  // 4. GLOW EFFECT IMPLEMENTATION
  //////////////////////////////////////////////////////////
  
  // Update the glow effect implementation
  useEffect(() => {
    if (!chartRef.current || !isMounted) return;
    
    const chart = chartRef.current;
    const ctx = chart.ctx;
    const canvas = chart.canvas;
    
    // Function to apply the glow effect
    const applyGlowEffect = () => {
      // Store the original stroke method if we haven't already
      if (!originalStrokeRef.current) {
        originalStrokeRef.current = ctx.stroke;
      }
      
      // Only override if it's not already our custom implementation
      if (ctx.stroke === originalStrokeRef.current) {
        // Custom stroke method that adds glow effect to all lines
        ctx.stroke = function() {
          const self = this;
          self.save();
          
          // Only apply shadow if showNeonShadow is true
          if (showNeonShadow) {
            // Use the global shadow color as fallback
            let currentShadowColor = shadowColor;
            
            // Try to determine which dataset is being drawn based on stroke style
            if (self.strokeStyle) {
              const strokeColor = self.strokeStyle.toString();
              // Find the dataset with matching line color
              const datasetIndex = datasets.findIndex(d => 
                (d.lineColor || lineColor) === strokeColor
              );
              
              if (datasetIndex >= 0 && datasetShadowColorsRef.current[datasetIndex]) {
                currentShadowColor = datasetShadowColorsRef.current[datasetIndex];
              }
            }
            
            // Convert shadow color to rgba with configurable opacity
            let shadowColorWithOpacity = currentShadowColor;
            
            // If it's a hex or named color, convert it
            if (!currentShadowColor.startsWith('rgba')) {
              try {
                const tempEl = document.createElement('div');
                tempEl.style.color = currentShadowColor;
                document.body.appendChild(tempEl);
                const computedColor = getComputedStyle(tempEl).color;
                document.body.removeChild(tempEl);
                
                // Convert rgb to rgba with the shadow opacity
                shadowColorWithOpacity = computedColor.replace('rgb', 'rgba').replace(')', `, ${shadowOpacity})`);
              } catch (e) {
                console.warn('Could not convert shadow color, using original', e);
              }
            }
            
            // Apply the shadow with opacity
            self.shadowColor = shadowColorWithOpacity;
            self.shadowBlur = 10; // Controls the size of the glow
            self.shadowOffsetX = 0;
            self.shadowOffsetY = 0;
          }
          
          // These properties make the line and glow rounded
          self.lineJoin = 'round';
          self.lineCap = 'round';
          
          // Call the original stroke method with the correct context
          originalStrokeRef.current.apply(self, arguments);
          
          self.restore();
        };
      }
    };
    
    // Apply the glow effect initially
    applyGlowEffect();
    
    // Create a MutationObserver to detect DOM changes
    const observer = new MutationObserver(() => {
      // Small delay to ensure the chart has been updated
      setTimeout(applyGlowEffect, 0);
    });
    
    // Observe the entire document for changes
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    });
    
    // Also set up a periodic reapplication of the effect
    const intervalId = setInterval(applyGlowEffect, 100);
    
    // Force a redraw of the chart
    chart.update();
    
    // Cleanup function
    return () => {
      if (originalStrokeRef.current && ctx) {
        ctx.stroke = originalStrokeRef.current;
      }
      observer.disconnect();
      clearInterval(intervalId);
    };
  }, [chartRef.current, isMounted, showNeonShadow, shadowColor, shadowOpacity, datasets, lineColor]);

  //////////////////////////////////////////////////////////
  // 5. CHART DATA CONFIGURATION
  //////////////////////////////////////////////////////////
  
  const chartData = {
    labels,
    datasets: datasets.map((dataset, index) => {
      // Use dataset-specific properties or fall back to global props
      const datasetLineColor = dataset.lineColor || lineColor;
      const datasetShadowColor = dataset.shadowColor || shadowColor || datasetLineColor;
      
      // Store the shadow color in our ref
      datasetShadowColorsRef.current[index] = datasetShadowColor;
      
      const datasetFillColor = dataset.fillColor || fillColor || datasetLineColor;
      const datasetFill = dataset.fill !== undefined ? dataset.fill : fill;
      const datasetFillOpacity = dataset.fillOpacity !== undefined ? dataset.fillOpacity : fillOpacity;
      const datasetShowPoints = dataset.showPoints !== undefined ? dataset.showPoints : showPoints;
      const datasetPointRadius = dataset.pointRadius || pointRadius;
      const datasetPointColor = dataset.pointColor || pointColor || datasetLineColor;
      const datasetPointBorderColor = dataset.pointBorderColor || pointBorderColor;
      
      // Store the line color for tooltip use
      datasetColorsRef.current[index] = datasetLineColor;
      
      return {
        fill: datasetFill,
        label: dataset.label || `Dataset ${index + 1}`,
        data: dataset.data,
        borderColor: datasetLineColor,
        backgroundColor: (context: any) => {
          if (!isMounted) return 'rgba(255, 255, 255, 0.2)';
          
          if (!datasetFill) return 'rgba(0, 0, 0, 0)';
          
          const baseColor = datasetFillColor;
          
          try {
            //////////////////////////////////////////////////////////
            // 5a. GRADIENT FILL CREATION
            //////////////////////////////////////////////////////////
            if (gradientToTransparent) {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
              
              //////////////////////////////////////////////////////////
              // 5b. COLOR FORMAT CONVERSION
              //////////////////////////////////////////////////////////
              // Convert various color formats (hex, rgb, rgba, named) to rgba
              // This allows us to apply opacity consistently across all formats
              let startColor;
              if (baseColor.startsWith('rgb')) {
                // Handle RGB format by adding opacity
                startColor = baseColor.replace('rgb', 'rgba').replace(')', `, ${datasetFillOpacity})`);
              } else if (baseColor.startsWith('rgba')) {
                // Handle RGBA format by replacing existing opacity
                startColor = baseColor.replace(/,\s*[\d\.]+\)$/, `, ${datasetFillOpacity})`);
              } else {
                // Handle hex or named colors by converting to rgba
                startColor = `rgba(255, 255, 255, ${datasetFillOpacity})`; // Default fallback
                if (baseColor !== '#ffffff') {
                  try {
                    // Use DOM to convert hex/named colors to rgb format
                    const tempEl = document.createElement('div');
                    tempEl.style.color = baseColor;
                    document.body.appendChild(tempEl);
                    const computedColor = getComputedStyle(tempEl).color;
                    document.body.removeChild(tempEl);
                    
                    // Convert the computed rgb to rgba with our opacity
                    startColor = computedColor.replace('rgb', 'rgba').replace(')', `, ${datasetFillOpacity})`);
                  } catch (e) {
                    console.warn('Could not convert color, using default', e);
                  }
                }
              }
              
              //////////////////////////////////////////////////////////
              // 5c. GRADIENT CONFIGURATION
              //////////////////////////////////////////////////////////
              // Add the start color at position 0 (top of chart)
              gradient.addColorStop(0, startColor);
              
              // Clamp the gradient stop percentage to a maximum of 1
              const stopPosition = Math.min(1, gradientStopPercentage);
              
              // Add the transparent stop at the clamped position
              gradient.addColorStop(stopPosition, 'rgba(0, 0, 0, 0)');
              
              return gradient;
            } 
            //////////////////////////////////////////////////////////
            // 5d. SOLID FILL CREATION
            //////////////////////////////////////////////////////////
            else {
              // Create solid color with opacity
              if (baseColor.startsWith('rgb') && !baseColor.startsWith('rgba')) {
                return baseColor.replace('rgb', 'rgba').replace(')', `, ${datasetFillOpacity})`);
              } else if (baseColor.startsWith('rgba')) {
                return baseColor.replace(/,\s*[\d\.]+\)$/, `, ${datasetFillOpacity})`);
              } else {
                // For hex or named colors
                try {
                  const tempEl = document.createElement('div');
                  tempEl.style.color = baseColor;
                  document.body.appendChild(tempEl);
                  const computedColor = getComputedStyle(tempEl).color;
                  document.body.removeChild(tempEl);
                  
                  return computedColor.replace('rgb', 'rgba').replace(')', `, ${datasetFillOpacity})`);
                } catch (e) {
                  console.warn('Could not convert color, using default', e);
                  return `rgba(255, 255, 255, ${datasetFillOpacity})`;
                }
              }
            }
          } catch (e) {
            console.warn('Error creating fill', e);
            return `rgba(255, 255, 255, ${datasetFillOpacity})`;
          }
        },
        borderWidth: lineWidth,
        pointRadius: datasetShowPoints ? datasetPointRadius : 0,
        pointBackgroundColor: datasetPointColor,
        pointBorderColor: datasetPointBorderColor,
        pointBorderWidth: pointBorderWidth,
        pointHoverRadius: showTooltip ? (datasetPointRadius + 1) : 0,
        pointHoverBackgroundColor: datasetPointColor,
        pointHoverBorderColor: datasetPointBorderColor,
        pointHoverBorderWidth: pointBorderWidth + 1,
        pointHitRadius: 10,
        tension: lineTension,
      };
    }),
  };

  //////////////////////////////////////////////////////////
  // 6. CHART OPTIONS CONFIGURATION
  //////////////////////////////////////////////////////////
  
  // Determine grid visibility based on specific and general props
  // If specific grid props are provided, use them, otherwise fall back to the general showGrid prop
  const displayXGrid = showXGrid !== undefined ? showXGrid : showGrid;
  const displayYGrid = showYGrid !== undefined ? showYGrid : showGrid;
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: displayXGrid, // Use the specific X grid setting
          drawBorder: false,
          color: gridColor, // Configurable grid color
        },
        border: {
          display: showXAxisLine,
        },
        ticks: {
          display: showTicks,
          color: tickColor,
          font: {
            size: tickFontSize, // Configurable tick font size
          },
        },
      },
      y: {
        grid: {
          display: displayYGrid, // Use the specific Y grid setting
          drawBorder: false,
          color: gridColor, // Configurable grid color
        },
        border: {
          display: showYAxisLine,
        },
        title: {
          display: !!yAxisTitle, // Only show if yAxisTitle is provided
          text: yAxisTitle || '',
          color: tickColor,
          font: {
            size: tickFontSize,
          },
        },
        min: yAxisMin,
        max: yAxisMax,
        ticks: {
          display: showTicks,
          color: tickColor,
          font: {
            size: tickFontSize, // Configurable tick font size
          },
          callback: (value: any) => {
            // Format number with commas and max 2 decimals
            const formattedValue = new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            }).format(value);
            return `$${formattedValue}`;
          },
        },
      },
    },
    plugins: {
      legend: {
        display: showLabel, // Configurable legend display
        labels: {
          color: labelColor,
        }
      },
      tooltip: {
        enabled: showTooltip,
        backgroundColor: tooltipBackgroundColor,
        titleColor: tooltipTitleColor,
        titleFont: {
          size: tooltipTitleFont,
        },
        bodyFont: {
          size: tooltipBodyFont,
        },
        padding: tooltipPadding,
        displayColors: false, // Hide color boxes completely
        intersect: false,
        mode: 'index',
        callbacks: {
          // Customize the label text and color
          labelTextColor: function(context: any) {
            // Use the dataset's line color for the text if tooltipUseLineColors is true
            if (tooltipUseLineColors && 
                context.datasetIndex < datasetColorsRef.current.length) {
              return datasetColorsRef.current[context.datasetIndex];
            }
            return tooltipLabelColor; // Use theme-aware label color
          },
          // Format the label text with commas and max 2 decimals
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              // Format number with commas and max 2 decimals
              const formattedValue = new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              }).format(context.parsed.y);
              label += `$${formattedValue}`;
            }
            return label;
          }
        },
      },
      datalabels: {
        display: true,
        color: function(context: any) {
          // Use the dataset's line color for data labels
          if (context.datasetIndex < datasetColorsRef.current.length) {
            return datasetColorsRef.current[context.datasetIndex];
          }
          return '#ffffff';
        },
        anchor: 'end',
        align: 'top',
        font: {
          size: 10,
          weight: '500',
        },
        formatter: function(value: number) {
          // Format number with commas and max 2 decimals
          return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }).format(value);
        },
        padding: {
          top: 4,
        },
      },
    },
    // Add hover interaction configuration
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
  };

  //////////////////////////////////////////////////////////
  // 7. RENDER WITH LOADING STATE
  //////////////////////////////////////////////////////////
  
  // Only render the chart on the client side
  if (!isMounted) {
    return (
      <div className="w-full h-full rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg font-medium">{chartTitle}</h3>
          <div className="text-white/70 text-sm">{chartSubtitle}</div>
        </div>
        <div style={{ height: typeof height === 'number' ? `${height}px` : height }} className="flex items-center justify-center">
          <p className="text-white/50">Loading chart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl">
      {(showTitle || showSubtitle) && (
        <div className="flex justify-between items-center mb-4">
          {showTitle && (
            <h3 className="font-medium" 
                style={{ 
                  color: titleColor, 
                  fontSize: `${titleFontSize}px` 
                }}>
              {chartTitle}
            </h3>
          )}
          {showSubtitle && (
            <div style={{ 
              color: subtitleColor, 
              fontSize: `${subtitleFontSize}px` 
            }}>
              {chartSubtitle}
            </div>
          )}
        </div>
      )}
      <div style={{ 
        height: typeof height === 'number' ? `${height}px` : height,
        width: '100%'
      }}>
        <Line 
          ref={chartRef as any} 
          data={chartData} 
          options={{
            ...options as any,
            maintainAspectRatio: false, // This is crucial for full height
          }} 
        />
      </div>
    </div>
  );
}; 


/*
height={200}
        // Default values for styling props with white as default
        showNeonShadow = {false}
        showGrid = {true}
        showXAxisLine = {false}
        showYAxisLine = {false}
        showLabel = {false}
        lineColor = '#ffffff'
        shadowColor = '#ffffff'
        labelColor = 'rgba(255, 255, 255, 0.7)'
        tickColor = 'rgba(255, 255, 255, 0.7)'
        chartTitle = 'Sales'
        chartSubtitle = '4 months'
        showTooltip = {true}
        lineTension = {0.4}
        lineWidth = {2}
        showTicks = {true}
        showPoints = {false}
        pointRadius = {3}
        pointColor = '#ffffff'
        pointBorderColor = '#ffffff'
        pointBorderWidth = {1}
        showTitle = {true}
        showSubtitle = {true}
        titleColor = '#ffffff'
        subtitleColor = 'rgba(255, 255, 255, 0.7)'
        // Default values for new fill and gradient props
        fill = {true}
        fillOpacity = {0.5}
        gradientToTransparent = {true}
        // Default value for new gradient control prop
        gradientStopPercentage = {1.0}
        // Default values for new grid control props
        showXGrid = {false}
        showYGrid = {false}
        gridColor = 'rgba(255, 255, 255, 0.1)'
        // Default values for new font size props
        tickFontSize = {10}
        titleFontSize = {16}
        subtitleFontSize = {14}
        fillColor = '#ffffff'
        // Default values for new tooltip props
        tooltipBackgroundColor = 'rgba(0, 0, 0, 0.7)'
        tooltipPadding = {10}
        tooltipTitleColor = '#ffffff'
        tooltipBodyFont = {12}
        tooltipTitleFont = {12}
        tooltipUseLineColors = {true}
        shadowOpacity = {0.5}

      */
