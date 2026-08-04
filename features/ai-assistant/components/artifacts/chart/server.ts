/**
 * Chart Artifact Handler (Server-Side)
 * 
 * Purpose: Generates chart JSON data and streams it to the artifact UI
 * Used in: Agents after createDocument tool is called with kind='chart'
 * Why: Handles the actual content generation and streaming for chart artifacts
 * 
 * How it works:
 * 1. Phase 1: Gets labels/ticks first and initializes chart with zeros
 * 2. Phase 2: Streams actual data values incrementally
 * 3. Signals completion when done
 * 4. Saves to Supabase for persistence
 * 
 * Usage:
 * - Called after createDocument tool execution
 * - Only for chart artifacts (kind === 'chart')
 * - Content is streamed as it's generated
 */

import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod/v3';
import type { UIMessageStreamWriter } from 'ai';
import { supabaseAdmin } from '@/lib/supabase/client';
import { logger } from '@/features/ai-assistant/lib/logger';
import { generateUUID } from '@/features/ai-assistant/lib/utils';

/**
 * Parameters for creating a chart document
 */
interface CreateChartDocumentParams {
  /** Document title (used as prompt) */
  title: string;
  /** Data stream writer for streaming content to UI */
  dataStream: UIMessageStreamWriter<any>;
  /** Document ID (optional, will be generated if not provided) */
  documentId?: string;
  /** Dashboard data context (optional, for dashboard-related queries) */
  dashboardData?: any[];
}

/**
 * Create Chart Document
 * 
 * Generates chart JSON data using AI with two-phase streaming:
 * 1. Phase 1: Gets labels/ticks and initializes chart with zeros
 * 2. Phase 2: Streams actual data values incrementally
 * 
 * After streaming completes, saves the document to Supabase for persistence.
 * 
 * Uses streamObject for structured JSON generation.
 * 
 * @param params - Parameters including title, dataStream, and optional documentId
 * @returns Full generated JSON content as string
 * 
 * @example
 * ```typescript
 * await createChartDocument({
 *   title: "RTC Payment Trendline - Past 6 months",
 *   dataStream: writer,
 *   documentId: "doc-123" // Optional
 * });
 * ```
 */
export async function createChartDocument({
  title,
  dataStream,
  documentId,
  dashboardData,
}: CreateChartDocumentParams): Promise<string> {
  logger.debug('[Chart Artifact] createChartDocument called', {
    title,
    documentId: documentId || 'NOT PROVIDED',
    hasDataStream: !!dataStream,
    hasDashboardData: !!dashboardData,
    dashboardDataLength: dashboardData?.length || 0,
  });

  let fullContent = '';

  // ✅ PHASE 1: Get labels AND actual data values (to calculate accurate Y-axis scale)
  // We generate the data values but don't display them yet - we use them to set the Y-axis scale
  // Then we send chart structure with zeros but correct Y-axis scale
  logger.debug('[Chart Artifact] Phase 1: Getting labels, structure, and data values for Y-axis scale...');
  
  const structureSchema = z.object({
    labels: z.array(z.string()).describe('Array of labels for the x-axis (e.g., ["Jan", "Feb", "Mar"])'),
    datasetLabels: z.array(z.string()).optional().describe('Array of dataset labels (e.g., ["RTC Payments", "Other Payments"])'),
    datasets: z.array(z.object({
      data: z.array(z.number()).describe('Array of actual data values for this dataset. Generate the complete set of values that will be displayed. Length should match labels array.'),
    })).describe('Array of datasets with their actual data values. Generate all values now so we can calculate the Y-axis scale accurately.'),
  });

  // Build system prompt with dashboard data context if provided
  let structureSystemPrompt = `You are a helpful assistant that determines the structure AND generates actual data values for line charts.
Based on the user's request, you need to:
1. Determine the x-axis labels (time periods, categories, etc.)
2. Determine the dataset labels (what data series will be shown)
3. **CRITICAL**: Generate the ACTUAL data values for each dataset (complete set of values)

IMPORTANT:
- Generate the complete set of data values NOW (all values for all datasets)
- These values will be used to calculate the Y-axis scale accurately
- The values will be streamed to the UI later, but we need them now to set the correct Y-axis range
- Use the dashboard data context provided to generate accurate, realistic values

CRITICAL - DATASET LABELS:
- For payment-related charts, use labels like "RTC Payment", "Total Payments", "Payments", etc.
- For sales-related charts, use "Sales", "Revenue", etc.
- For other metrics, use descriptive labels that match the data type
- DO NOT use generic labels like "Data" or "Value" - be specific to the context

Return the complete structure with labels AND actual data values.
No explanations or markdown formatting.`;

  if (dashboardData && dashboardData.length > 0) {
    // Calculate summary statistics
    const totalRecords = dashboardData.length;
    const uniqueLocs = Array.from(new Set(dashboardData.map(d => d.loc))).sort();
    const totalPayments = dashboardData.reduce((sum, d) => sum + (d.payments || 0), 0);
    
    // Group by loc and calculate totals
    const locTotals = uniqueLocs.map(loc => {
      const records = dashboardData.filter(d => d.loc === loc);
      const totalPaid = records.reduce((sum, d) => sum + (d.payments || 0), 0);
      return { loc, totalPaid, recordCount: records.length };
    });
    
    structureSystemPrompt += `\n\nDASHBOARD DATA CONTEXT:
- Total Records: ${totalRecords}
- Available Locations (LOCs): ${uniqueLocs.join(', ')}
- Total Payments Across All Records: $${totalPayments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

LOCATION SUMMARY (for reference):
${locTotals.map(l => `- ${l.loc}: ${l.recordCount} records, Total Paid: $${l.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`).join('\n')}

CRITICAL INSTRUCTIONS:
- When creating charts about facilities/locations, you MUST use the actual LOC values from the data above (e.g., 'RTC', 'IOP', '905', '1000', 'OP Group', 'PHP')
- DO NOT use generic names like "Facility A", "Facility B", etc.
- For time-based charts, use appropriate time periods (months, weeks, etc.)
- Generate data values based on the actual dashboard data patterns shown above
- Use realistic values that match the data context (e.g., if RTC has $21,000 in total, monthly values should be in a similar range)`;
  }

  const { fullStream: structureStream } = streamObject({
    model: openai('o3-mini'),
    system: structureSystemPrompt,
    prompt: `${title}\n\nDetermine the x-axis labels, dataset labels, and generate the complete set of actual data values for this chart.`,
    schema: structureSchema,
  });

  let labels: string[] = [];
  let datasetLabels: string[] = [];
  let actualDataValues: number[][] = []; // Store actual values to calculate Y-axis scale
  let initialChartData: any = null;

  // Get structure and actual data values
  for await (const delta of structureStream) {
    if (delta.type === 'object') {
      const { object } = delta;
      if (object) {
        labels = (object.labels || []).filter((label): label is string => typeof label === 'string');
        datasetLabels = (object.datasetLabels || ['Data']).filter((label): label is string => typeof label === 'string');
        
        // Extract actual data values from the generated structure
        if (object.datasets && Array.isArray(object.datasets)) {
          actualDataValues = object.datasets.map((dataset: any) => {
            const values = (dataset.data || []).filter((v: any): v is number => typeof v === 'number');
            return values;
          });
        }
        
        // Calculate Y-axis min/max from actual data values
        let yAxisMin: number | undefined = undefined;
        let yAxisMax: number | undefined = undefined;
        
        if (actualDataValues.length > 0 && actualDataValues[0].length > 0) {
          // Flatten all datasets to get all values
          const allValues = actualDataValues.flat();
          if (allValues.length > 0) {
            const minValue = Math.min(...allValues);
            const maxValue = Math.max(...allValues);
            
            // Add padding (10% above max, 10% below min, but ensure min is at least 0 for positive values)
            const range = maxValue - minValue;
            const padding = range * 0.1;
            
            yAxisMin = Math.max(0, minValue - padding); // Don't go below 0 for payment/sales data
            yAxisMax = maxValue + padding;
            
            logger.debug('[Chart Artifact] Calculated Y-axis scale from actual data', {
              minValue,
              maxValue,
              yAxisMin,
              yAxisMax,
              dataPointsCount: allValues.length,
            });
          }
        }
        
        // Create initial chart data with zeros but correct Y-axis scale
        initialChartData = {
          labels: labels,
          datasets: datasetLabels.map((label, index) => ({
            data: new Array(labels.length).fill(0), // Fill with zeros for now
            label: label,
          })),
          // Include Y-axis scale in the chart data
          yAxisMin,
          yAxisMax,
        };

        // Send initial structure to UI (chart renders with zeros but correct Y-axis scale)
        const initialJson = JSON.stringify(initialChartData, null, 2);
        fullContent = initialJson; // Keep track for saving
        dataStream.write({
          type: 'data-chartDelta',
          data: initialJson,
          transient: true,
        });

        logger.debug('[Chart Artifact] Phase 1 complete: Labels and Y-axis scale initialized', {
          labelCount: labels.length,
          datasetCount: datasetLabels.length,
          labels: labels.slice(0, 5), // Log first 5 labels
          datasetLabels,
          yAxisMin,
          yAxisMax,
          actualDataValuesCount: actualDataValues.length,
        });
      }
    }
  }

  if (!initialChartData || labels.length === 0) {
    logger.error('[Chart Artifact] Phase 1 failed: No labels received', {
      title,
      documentId: documentId || 'NOT PROVIDED',
    });
    // Signal completion even on error
    dataStream.write({
      type: 'data-artifactStatus',
      data: 'complete',
      transient: true,
    });
    return fullContent || '{}';
  }

  // ✅ PHASE 2: Stream actual data values incrementally (using pre-generated values from Phase 1)
  logger.debug('[Chart Artifact] Phase 2: Streaming pre-generated data values...');
  
  let deltaCount = 0;
  let currentChartData = { 
    ...initialChartData,
    // Preserve Y-axis scale from Phase 1
    yAxisMin: initialChartData.yAxisMin,
    yAxisMax: initialChartData.yAxisMax,
  };

  // Stream the actual data values we generated in Phase 1
  // We already have the values in actualDataValues, so we'll stream them incrementally
  if (actualDataValues.length > 0) {
    // Stream each dataset's values
    for (let datasetIndex = 0; datasetIndex < actualDataValues.length; datasetIndex++) {
      const values = actualDataValues[datasetIndex];
      
      if (values && values.length > 0 && currentChartData.datasets[datasetIndex]) {
        // Update the dataset with actual values
        // We'll do this incrementally to show streaming effect
        const chunkSize = Math.max(1, Math.ceil(values.length / 5)); // Stream in ~5 chunks
        
        for (let chunkStart = 0; chunkStart < values.length; chunkStart += chunkSize) {
          const chunkEnd = Math.min(chunkStart + chunkSize, values.length);
          const chunk = values.slice(chunkStart, chunkEnd);
          
          // Update values in this chunk
          chunk.forEach((value: number, chunkIndex: number) => {
            const globalIndex = chunkStart + chunkIndex;
            if (globalIndex < currentChartData.datasets[datasetIndex].data.length) {
              currentChartData.datasets[datasetIndex].data[globalIndex] = value;
            }
          });

          // Send updated chart data to UI
          const jsonContent = JSON.stringify(currentChartData, null, 2);
          fullContent = jsonContent; // Keep track of latest for saving
          deltaCount++;

          dataStream.write({
            type: 'data-chartDelta',
            data: jsonContent, // Send full updated JSON each time
            transient: true,
          });

          logger.debug('[Chart Artifact] Phase 2: Data chunk streamed', {
            deltaNumber: deltaCount,
            datasetIndex,
            chunkStart,
            chunkEnd,
            valueCount: chunk.length,
            contentLength: jsonContent.length,
          });

          // Small delay to create streaming effect (optional - can be removed for faster streaming)
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    }
  } else {
    logger.warn('[Chart Artifact] Phase 2: No actual data values from Phase 1 to stream', {
      actualDataValuesLength: actualDataValues.length,
    });
  }

  logger.debug('[Chart Artifact] Streaming completed', {
    totalDeltas: deltaCount,
    contentLength: fullContent.length,
    documentId: documentId || 'NOT PROVIDED',
    finalLabelCount: labels.length,
    finalDatasetCount: datasetLabels.length,
  });

  // Signal completion
  logger.debug('[Chart Artifact] Sending completion status to UI...', {
    timestamp: new Date().toISOString(),
    finalContentLength: fullContent.length,
  });
  dataStream.write({
    type: 'data-artifactStatus',
    data: 'complete',
    transient: true,
  });
  
  logger.debug('[Chart Artifact] Completion status sent', {
    timestamp: new Date().toISOString(),
  });

  // ✅ PERSISTENCE PHASE: Save to Supabase AFTER streaming completes
  // Note: This happens after streaming, so it doesn't block the UI
  // If documentId is provided, use it; otherwise skip saving (will be saved in agent)
  logger.debug('[Chart Artifact] Pre-save check', {
    hasDocumentId: !!documentId,
    documentId: documentId || 'MISSING',
    fullContentLength: fullContent.length,
    fullContentPreview: fullContent.substring(0, 100),
  });

  if (documentId) {
    // Validate fullContent before saving
    if (!fullContent || fullContent.trim().length === 0) {
      logger.error('[Chart Artifact] Cannot save: fullContent is empty', {
        documentId,
        title,
        fullContentLength: fullContent.length,
      });
    } else {
      try {
        logger.info(`[Chart Artifact] Starting Supabase save operation`, {
          documentId,
          title,
          contentLength: fullContent.length,
          kind: 'chart',
        });
      
      // Generate a temporary user ID (UUID format) for development
      // TODO: Replace with actual user ID from authentication session
      const tempUserId = generateUUID();
      
      const documentData = {
        id: documentId,
        title,
        content: fullContent,
        kind: 'chart' as const,
        userId: tempUserId, // Temporary UUID for development - replace with actual user ID
        createdAt: new Date().toISOString(),
      };

      logger.debug('[Chart Artifact] Supabase insert payload', {
        id: documentData.id,
        title: documentData.title,
        contentLength: documentData.content.length,
        kind: documentData.kind,
        userId: documentData.userId,
        createdAt: documentData.createdAt,
      });

      const { data, error } = await supabaseAdmin
        .from('Document')
        .insert(documentData as any)
        .select();

      if (error) {
        logger.error('[Chart Artifact] Supabase insert error', {
          documentId,
          error: error.message,
          errorCode: error.code,
          errorDetails: error.details,
          errorHint: error.hint,
        });
        // Don't throw - artifact still works, just not persisted
        // User already sees the content via streaming
      } else {
        logger.info(`[Chart Artifact] Successfully saved document to Supabase`, {
          documentId,
          title,
          savedAt: new Date().toISOString(),
          returnedData: data,
        });
        logger.debug('[Chart Artifact] Supabase response data', data);
      }
    } catch (error) {
      logger.error('[Chart Artifact] Unexpected error during Supabase save', {
        documentId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Don't throw - streaming already completed successfully
      }
    }
  } else {
    logger.warn('[Chart Artifact] No documentId provided, skipping Supabase save', {
      title,
      contentLength: fullContent.length,
      reason: 'documentId was not provided to createChartDocument',
      documentIdValue: documentId,
      documentIdType: typeof documentId,
    });
  }

  return fullContent;
}
