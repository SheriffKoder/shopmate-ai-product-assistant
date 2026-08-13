/**
 * Logger Utility
 * 
 * Purpose: Centralized logging for AI Assistant
 * Used in: API routes, agents, utilities, runtime nodes, and components
 * Why: Provides consistent logging with environment awareness and better debugging
 *
 * Function Index:
 * logger.debug / info / warn / error: Levelled console logs.
 * logger.separator: Development banner lines.
 * logger.node: One routing-node trace with input, details, result, and status.
 * logger.classification: Compatibility wrapper around logger.node.
 *
 * Steps:
 * 1. Gate debug logs to development.
 * 2. Print a named banner for each assistant node.
 * 3. Include input, what happened, result, and error or success.
 */

/**
 * Log levels for different types of messages
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Logger configuration
 */
interface LoggerConfig {
  /**
   * Whether to enable debug logs (only in development)
   */
  enableDebug: boolean;
  
  /**
   * Whether to enable info logs
   */
  enableInfo: boolean;
  
  /**
   * Prefix for all log messages
   */
  prefix: string;
}

/**
 * Default logger configuration
 */
const defaultConfig: LoggerConfig = {
  enableDebug: process.env.NODE_ENV === 'development',
  enableInfo: true,
  prefix: '[AI Assistant]',
};

/** Outcome printed in a node banner. */
export type AssistantNodeStatus = 'success' | 'error' | 'skipped';

/** One routing or agent node trace for the terminal. */
export interface AssistantNodeLog {
  /** Banner title, for example QUERY CLASSIFICATION. */
  name: string;
  /** Payload the node received. */
  input?: unknown;
  /** Short explanation of what the node did. */
  details?: unknown;
  /** Decision or output. */
  result?: unknown;
  status?: AssistantNodeStatus;
  error?: unknown;
}

/** Print a scalar inline and keep objects inspectable. */
function logNodeField(
  debug: (message: string, data?: unknown) => void,
  label: string,
  value: unknown,
): void {
  if (value === undefined) return;

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    debug(`${label}: ${value}`);
    return;
  }

  debug(`${label}:`, value);
}

/**
 * Format log message with prefix and timestamp
 */
function formatMessage(level: LogLevel, message: string, data?: any): string {
  const timestamp = new Date().toISOString();
  const prefix = `${defaultConfig.prefix} [${timestamp}] [${level.toUpperCase()}]`;
  
  if (data !== undefined) {
    return `${prefix} ${message}`;
  }
  
  return `${prefix} ${message}`;
}

/**
 * Logger object with different log levels
 */
export const logger = {
  /**
   * Debug logs - only shown in development
   * Use for detailed debugging information
   * 
   * @param message - Log message
   * @param data - Optional data to log
   */
  debug: (message: string, data?: any): void => {
    if (!defaultConfig.enableDebug) {
      return;
    }
    
    const formatted = formatMessage('debug', message);
    if (data !== undefined) {
      console.log(formatted, data);
    } else {
      console.log(formatted);
    }
  },

  /**
   * Info logs - general information
   * Use for important events and flow tracking
   * 
   * @param message - Log message
   * @param data - Optional data to log
   */
  info: (message: string, data?: any): void => {
    if (!defaultConfig.enableInfo) {
      return;
    }
    
    const formatted = formatMessage('info', message);
    if (data !== undefined) {
      console.log(formatted, data);
    } else {
      console.log(formatted);
    }
  },

  /**
   * Warning logs - potential issues
   * Use for warnings that don't break functionality
   * 
   * @param message - Log message
   * @param data - Optional data to log
   */
  warn: (message: string, data?: any): void => {
    const formatted = formatMessage('warn', message);
    if (data !== undefined) {
      console.warn(formatted, data);
    } else {
      console.warn(formatted);
    }
  },

  /**
   * Error logs - actual errors
   * Use for errors that need attention
   * 
   * @param message - Log message
   * @param error - Error object or data
   */
  error: (message: string, error?: any): void => {
    const formatted = formatMessage('error', message);
    if (error !== undefined) {
      console.error(formatted, error);
      
      // FUTURE IMPLEMENTATION: Send errors to error tracking service
      // if (process.env.NODE_ENV === 'production') {
      //   // Send to Sentry, LogRocket, or similar service
      //   errorTrackingService.captureException(error, {
      //     tags: { component: 'ai-assistant' },
      //     extra: { message },
      //   });
      // }
    } else {
      console.error(formatted);
    }
  },

  /**
   * Log a separator line (useful for debugging)
   * Only shown in development
   */
  separator: (label?: string): void => {
    if (!defaultConfig.enableDebug) {
      return;
    }
    
    const line = '='.repeat(50);
    if (label) {
      console.log(`\n${line}`);
      console.log(`${defaultConfig.prefix} ${label}`);
      console.log(`${line}\n`);
    } else {
      console.log(line);
    }
  },

  /**
   * Log one assistant routing or agent node.
   * Development only, except errors which always print.
   *
   * @example
   * logger.node({
   *   name: 'QUERY CLASSIFICATION',
   *   input: { query: 'Show me smartphones' },
   *   details: 'Outer classifier mapped the query to a shop route.',
   *   result: { classification: 'related' },
   *   status: 'success',
   * })
   */
  node: (entry: AssistantNodeLog): void => {
    const status = entry.status ?? (entry.error ? 'error' : 'success');
    if (!defaultConfig.enableDebug && status !== 'error') {
      return;
    }

    logger.separator(entry.name);
    logger.debug(`Status: ${status}`);
    logNodeField(logger.debug, 'Input', entry.input);
    logNodeField(logger.debug, 'Details', entry.details);
    logNodeField(logger.debug, 'Result', entry.result);
    if (entry.error !== undefined || status === 'error') {
      logger.error('Error:', entry.error ?? 'unknown error');
    }
    logger.separator();
  },

  /**
   * Log classification results (specific to our use case)
   * Only shown in development
   * 
   * @param type - Type of classification (query or product)
   * @param result - Classification result
   * @param query - User query that was classified
   */
  classification: (type: 'query' | 'product', result: string, query: string): void => {
    logger.node({
      name: `${type.toUpperCase()} CLASSIFICATION`,
      input: { query },
      details: `Mapped the query to ${result}.`,
      result,
      status: 'success',
    });
  },
};

/**
 * Configure logger settings
 * FUTURE IMPLEMENTATION: Allow runtime configuration
 * 
 * @param config - Partial logger configuration
 */
export function configureLogger(config: Partial<LoggerConfig>): void {
  Object.assign(defaultConfig, config);
}

