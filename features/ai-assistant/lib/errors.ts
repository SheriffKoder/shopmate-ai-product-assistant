/**
 * Error Handling System
 * 
 * Purpose: Centralized error handling for AI Assistant API
 * Used in: API routes, agents, and utilities
 * Why: Provides consistent error responses and user-friendly messages
 */

import { z } from 'zod';

/**
 * Error types that can occur in the application
 */
export type ErrorType =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "rate_limit"
  | "offline"
  | "server_error";

/**
 * Surfaces where errors can occur
 * FUTURE IMPLEMENTATION: Add more surfaces as features are added:
 * - "auth" (when authentication is added)
 * - "database" (when database is added)
 * - "stream" (when stream resumption is added)
 * - "history" (when chat history is added)
 */
export type Surface =
  | "api"
  | "agent"
  | "classification"
  | "tool";

/**
 * Error code format: "error_type:surface"
 * Example: "bad_request:api", "server_error:agent"
 */
export type ErrorCode = `${ErrorType}:${Surface}`;

/**
 * Custom error class for ShopMate AI Assistant
 */
export class ShopMateError extends Error {
  type: ErrorType;
  surface: Surface;
  statusCode: number;
  cause?: string;

  constructor(errorCode: ErrorCode, cause?: string) {
    super();
    
    const [type, surface] = errorCode.split(":") as [ErrorType, Surface];
    
    this.type = type;
    this.surface = surface;
    this.cause = cause;
    this.message = getMessageByErrorCode(errorCode);
    this.statusCode = getStatusCodeByType(this.type);
    this.name = 'ShopMateError';
  }

  /**
   * Convert error to HTTP Response
   */
  toResponse(): Response {
    const code: ErrorCode = `${this.type}:${this.surface}`;
    const { message, cause, statusCode } = this;

    return Response.json(
      {
        error: code,
        message,
        ...(cause && { cause }),
      },
      {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Get user-friendly error message by error code
 */
function getMessageByErrorCode(errorCode: ErrorCode): string {
  switch (errorCode) {
    // API errors
    case "bad_request:api":
      return "The request couldn't be processed. Please check your input and try again.";
    
    case "server_error:api":
      return "An error occurred while processing your request. Please try again later.";

    // Agent errors
    case "server_error:agent":
      return "An error occurred while processing your request with the AI agent. Please try again.";
    
    case "offline:agent":
      return "We're having trouble connecting to the AI service. Please check your internet connection and try again.";

    // Classification errors
    case "server_error:classification":
      return "An error occurred while classifying your query. Please try again.";
    
    case "bad_request:classification":
      return "Unable to classify your query. Please rephrase and try again.";

    // Tool errors
    case "server_error:tool":
      return "An error occurred while executing a tool. Please try again.";

    // FUTURE IMPLEMENTATION: Add error messages for these when features are implemented
    // case "unauthorized:auth":
    //   return "You need to sign in before continuing.";
    // case "forbidden:auth":
    //   return "Your account does not have access to this feature.";
    // case "rate_limit:api":
    //   return "You have exceeded your maximum number of requests. Please try again later.";
    // case "not_found:database":
    //   return "The requested resource was not found.";
    // case "server_error:database":
    //   return "An error occurred while accessing the database. Please try again later.";
    // case "offline:stream":
    //   return "We're having trouble sending your message. Please check your internet connection and try again.";

    default:
      return "Something went wrong. Please try again later.";
  }
}

/**
 * Get HTTP status code by error type
 */
function getStatusCodeByType(type: ErrorType): number {
  switch (type) {
    case "bad_request":
      return 400;
    case "unauthorized":
      return 401;
    case "forbidden":
      return 403;
    case "not_found":
      return 404;
    case "rate_limit":
      return 429;
    case "offline":
      return 503;
    case "server_error":
      return 500;
    default:
      return 500;
  }
}

/**
 * Handle errors in API routes
 * Converts various error types to appropriate HTTP responses
 * 
 * @param error - The error that occurred (can be ShopMateError, ZodError, or unknown)
 * @returns HTTP Response with error information
 */
export function handleApiError(error: unknown): Response {
  // Handle our custom errors
  if (error instanceof ShopMateError) {
    return error.toResponse();
  }

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    return new ShopMateError(
      "bad_request:api",
      error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
    ).toResponse();
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    // Log unexpected errors for debugging
    console.error('[ShopMateError] Unexpected error:', {
      message: error.message,
      stack: error.stack,
    });

    return new ShopMateError(
      "server_error:api",
      process.env.NODE_ENV === 'development' ? error.message : undefined
    ).toResponse();
  }

  // Handle unknown error types
  console.error('[ShopMateError] Unknown error type:', error);

  return new ShopMateError(
    "server_error:api",
    "An unexpected error occurred"
  ).toResponse();
}

/**
 * Helper function to create common error responses
 */
export const createError = {
  badRequest: (surface: Surface, cause?: string) =>
    new ShopMateError(`bad_request:${surface}`, cause),
  
  serverError: (surface: Surface, cause?: string) =>
    new ShopMateError(`server_error:${surface}`, cause),
  
  offline: (surface: Surface, cause?: string) =>
    new ShopMateError(`offline:${surface}`, cause),

  // FUTURE IMPLEMENTATION: Add more helpers when features are implemented
  // unauthorized: (surface: Surface, cause?: string) =>
  //   new ShopMateError(`unauthorized:${surface}`, cause),
  // forbidden: (surface: Surface, cause?: string) =>
  //   new ShopMateError(`forbidden:${surface}`, cause),
  // notFound: (surface: Surface, cause?: string) =>
  //   new ShopMateError(`not_found:${surface}`, cause),
  // rateLimit: (surface: Surface, cause?: string) =>
  //   new ShopMateError(`rate_limit:${surface}`, cause),
};

