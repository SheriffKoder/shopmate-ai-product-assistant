/**
 * Error Configuration for Toast Notifications
 * 
 * Purpose: Centralized error message mapping for user-friendly error notifications
 * Used in: Components that need to show error toasts
 * Why: Provides consistent error messaging across the application
 */

/**
 * Error configuration interface
 */
export interface ErrorConfig {
  title: string;
  message: string;
  duration?: number;
}

/**
 * Default error configuration
 */
const DEFAULT_ERROR_CONFIG: ErrorConfig = {
  title: 'Chat Error',
  message: 'An error occurred while processing your message.',
  duration: 5000,
};

/**
 * Error patterns and their corresponding configurations
 */
const ERROR_PATTERNS: Array<{
  pattern: RegExp | string;
  config: Omit<ErrorConfig, 'duration'>;
}> = [
  {
    pattern: /network|fetch|connection|ECONNREFUSED|ENOTFOUND/i,
    config: {
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
    },
  },
  {
    pattern: /timeout|ETIMEDOUT/i,
    config: {
      title: 'Request Timeout',
      message: 'The request took too long to process. Please try again.',
    },
  },
  {
    pattern: /rate limit|429|too many requests/i,
    config: {
      title: 'Rate Limit Exceeded',
      message: "You've sent too many messages. Please wait a moment and try again.",
    },
  },
  {
    pattern: /401|unauthorized|authentication|auth/i,
    config: {
      title: 'Authentication Error',
      message: 'Your session has expired. Please refresh the page.',
    },
  },
  {
    pattern: /403|forbidden|permission/i,
    config: {
      title: 'Permission Denied',
      message: 'You do not have permission to perform this action.',
    },
  },
  {
    pattern: /404|not found/i,
    config: {
      title: 'Not Found',
      message: 'The requested resource was not found. Please try again.',
    },
  },
  {
    pattern: /500|server error|internal server error/i,
    config: {
      title: 'Server Error',
      message: 'The server encountered an error. Please try again in a moment.',
    },
  },
  {
    pattern: /503|service unavailable|unavailable/i,
    config: {
      title: 'Service Unavailable',
      message: 'The service is temporarily unavailable. Please try again later.',
    },
  },
];

/**
 * Extract error message from various error types
 * 
 * @param error - The error object (can be Error, string, or unknown)
 * @returns The error message string
 */
function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    const errorObj = error as { message?: string };
    if (errorObj.message) {
      return String(errorObj.message);
    }
  }
  
  return DEFAULT_ERROR_CONFIG.message;
}

/**
 * Get error configuration based on error message patterns
 * 
 * @param error - The error object (can be Error, string, or unknown)
 * @param defaultDuration - Default duration for the toast (default: 5000ms)
 * @returns Error configuration with title, message, and duration
 * 
 * @example
 * ```typescript
 * const config = getErrorConfig(error);
 * showError(config.message, config.title, config.duration);
 * ```
 */
export function getErrorConfig(error: unknown, defaultDuration: number = 5000): ErrorConfig {
  const errorMessage = extractErrorMessage(error);
  
  // Check against error patterns
  for (const { pattern, config } of ERROR_PATTERNS) {
    const matches = typeof pattern === 'string' 
      ? errorMessage.toLowerCase().includes(pattern.toLowerCase())
      : pattern.test(errorMessage);
    
    if (matches) {
      return {
        ...config,
        duration: defaultDuration,
      };
    }
  }
  
  // Return default configuration if no pattern matches
  return {
    ...DEFAULT_ERROR_CONFIG,
    message: errorMessage || DEFAULT_ERROR_CONFIG.message,
    duration: defaultDuration,
  };
}

/**
 * Get a simplified error message for logging
 * 
 * @param error - The error object
 * @returns A string representation of the error for logging
 */
export function getErrorLogMessage(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}${error.stack ? `\n${error.stack}` : ''}`;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    return JSON.stringify(error, null, 2);
  }
  
  return String(error);
}

