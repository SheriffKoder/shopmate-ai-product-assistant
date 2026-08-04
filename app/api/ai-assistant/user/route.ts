/**
 * User API Route
 * 
 * Purpose: Handle user creation and retrieval
 * Used in: Chat header buttons (cloud-upload, cloud-download)
 * Why: Server-side API for user operations
 * 
 * Endpoints:
 * - POST /api/user - Create a new user
 * - GET /api/user?email={email} - Get user by email
 * - GET /api/user?constant=true - Get or create constant user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail, getOrCreateConstantUser } from '@/lib/supabase/queries/user-queries';
import { logger } from '@/features/ai-assistant/lib/logger';

/**
 * POST /api/user - Create a new user
 * 
 * Creates a new user in the database.
 * 
 * Request Body:
 * - email (required): User email address
 * - name (optional): User display name
 * 
 * Returns:
 * - 201: Created user object
 * - 400: Missing email or invalid request
 * - 409: User already exists
 * - 500: Server error
 * 
 * @example
 * ```typescript
 * POST /api/user
 * Body: { email: 'user@example.com', name: 'John Doe' }
 * Response: { user: { id: '...', email: '...', ... } }
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    //////////////////////////////////
    // Parse Request Body: Extract email and name
    // Why: Need to validate and use these values
    // How: Parse JSON from request body
    //////////////////////////////////
    let body;
    try {
      body = await request.json();
    } catch (error) {
      logger.warn('[User API] Invalid JSON in POST body');
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { email, name } = body;

    //////////////////////////////////
    // Validate Input: Ensure email is provided
    // Why: Email is required for user creation
    // How: Check if email exists and is not empty
    //////////////////////////////////
    if (!email || typeof email !== 'string' || email.trim() === '') {
      logger.warn('[User API] Missing or invalid email in POST');
      return NextResponse.json(
        { error: 'Email is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    logger.info(`[User API] Creating user with email: ${email}`);

    //////////////////////////////////
    // Check Existing User: Verify user doesn't already exist
    // Why: Email must be unique - prevent duplicates
    // How: Query database for existing user with same email
    //////////////////////////////////
    const existingUser = await getUserByEmail({ email: email.trim() });
    
    if (existingUser) {
      logger.warn(`[User API] User already exists with email: ${email}`);
      return NextResponse.json(
        { 
          error: 'User already exists',
          user: existingUser 
        },
        { status: 409 } // Conflict status code
      );
    }

    //////////////////////////////////
    // Create User: Insert new user into database
    // Why: Create the user record
    // How: Call createUser query function
    //////////////////////////////////
    const user = await createUser({ 
      email: email.trim(), 
      name: name?.trim() || undefined 
    });

    //////////////////////////////////
    // Error Handling: Check if creation succeeded
    // Why: Database operations can fail
    // How: Return error response if user is null
    //////////////////////////////////
    if (!user) {
      logger.error('[User API] Failed to create user');
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    logger.info(`[User API] Successfully created user: ${user.id}`);

    //////////////////////////////////
    // Success Response: Return created user
    // Why: Client needs the user object with generated ID
    // How: Return JSON response with 201 status
    //////////////////////////////////
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    //////////////////////////////////
    // Exception Handling: Catch unexpected errors
    // Why: Network issues, type errors, etc. can occur
    // How: Log error and return 500 response
    //////////////////////////////////
    logger.error('[User API] Unexpected error in POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user - Get user by email or get/create constant user
 * 
 * Retrieves a user from the database.
 * 
 * Query Parameters:
 * - email (optional): Get user by email address
 * - constant (optional): Get or create constant user (set to 'true')
 * 
 * Returns:
 * - 200: User object
 * - 400: Missing required parameter
 * - 404: User not found (only for email query)
 * - 500: Server error
 * 
 * @example
 * ```typescript
 * // Get user by email
 * GET /api/user?email=user@example.com
 * Response: { user: { id: '...', email: '...', ... } }
 * 
 * // Get or create constant user
 * GET /api/user?constant=true
 * Response: { user: { id: '...', email: 'shopmate-user@example.com', ... } }
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    //////////////////////////////////
    // Parse Query Parameters: Extract email and constant flags
    // Why: Need to determine which operation to perform
    // How: Parse URL search parameters
    //////////////////////////////////
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const constant = searchParams.get('constant');

    //////////////////////////////////
    // Get or Create Constant User: Handle constant user request
    // Why: This is the primary use case (cloud-download button)
    // How: Call getOrCreateConstantUser function
    //////////////////////////////////
    if (constant === 'true') {
      logger.info('[User API] Getting or creating constant user');
      
      const user = await getOrCreateConstantUser();

      //////////////////////////////////
      // Error Handling: Check if operation succeeded
      // Why: Database operations can fail
      // How: Return error response if user is null
      //////////////////////////////////
      if (!user) {
        logger.error('[User API] Failed to get or create constant user');
        return NextResponse.json(
          { error: 'Failed to get or create constant user' },
          { status: 500 }
        );
      }

      logger.info(`[User API] Successfully retrieved constant user: ${user.id}`);

      //////////////////////////////////
      // Success Response: Return user
      // Why: Client needs the user object
      // How: Return JSON response with 200 status
      //////////////////////////////////
      return NextResponse.json({ user });
    }

    //////////////////////////////////
    // Get User by Email: Handle email-based lookup
    // Why: Alternative way to get user
    // How: Call getUserByEmail function
    //////////////////////////////////
    if (email) {
      logger.info(`[User API] Getting user by email: ${email}`);

      const user = await getUserByEmail({ email: email.trim() });

      //////////////////////////////////
      // Error Handling: Check if user was found
      // Why: User might not exist
      // How: Return 404 if user is null
      //////////////////////////////////
      if (!user) {
        logger.info(`[User API] User not found with email: ${email}`);
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      logger.info(`[User API] Successfully found user: ${user.id}`);

      //////////////////////////////////
      // Success Response: Return user
      // Why: Client needs the user object
      // How: Return JSON response with 200 status
      //////////////////////////////////
      return NextResponse.json({ user });
    }

    //////////////////////////////////
    // Missing Parameter: Neither email nor constant provided
    // Why: Need at least one parameter to know what to do
    // How: Return 400 error
    //////////////////////////////////
    logger.warn('[User API] Missing required query parameter (email or constant)');
    return NextResponse.json(
      { error: 'Email or constant parameter required' },
      { status: 400 }
    );
  } catch (error) {
    //////////////////////////////////
    // Exception Handling: Catch unexpected errors
    // Why: Network issues, type errors, etc. can occur
    // How: Log error and return 500 response
    //////////////////////////////////
    logger.error('[User API] Unexpected error in GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
