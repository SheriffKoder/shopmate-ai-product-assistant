/**
 * User Database Queries
 * 
 * Purpose: Database operations for user management
 * Used in: User initialization and session management
 * Why: Centralized database queries for user operations
 * 
 * How it works:
 * 1. Uses supabaseAdmin client for server-side operations
 * 2. Handles errors gracefully with logging
 * 3. Returns null on errors (caller can handle)
 * 4. Provides type-safe operations using User types
 */

import { supabaseAdmin } from '@/lib/supabase/client';
import type { User, UserInsert } from '@/lib/supabase/types';
import { logger } from '@/features/ai-assistant/lib/logger';

/**
 * Create a new user in the database
 * 
 * Steps:
 * 1. Connect to Supabase client
 * 2. Insert user record with email and name
 * 3. Return created user or null if error
 * 
 * @param email - User email address (required, must be unique)
 * @param name - User name (optional)
 * @returns Created user object or null if error
 * 
 * @example
 * ```typescript
 * const user = await createUser({
 *   email: 'user@example.com',
 *   name: 'John Doe'
 * });
 * if (user) {
 *   console.log('User created:', user.id);
 * }
 * ```
 */
export async function createUser({
  email,
  name,
}: {
  email: string;
  name?: string;
}): Promise<User | null> {
  try {
    //////////////////////////////////
    // Validate Input: Ensure email is provided
    // Why: Email is required and must be unique
    //////////////////////////////////
    if (!email || email.trim() === '') {
      logger.warn('[createUser] Missing or empty email');
      return null;
    }

    //////////////////////////////////
    // Prepare User Data: Build insert object
    // Why: Supabase requires specific format
    // How: Map function parameters to database columns
    //////////////////////////////////
    const userData: UserInsert = {
      email: email.trim(),
      name: name?.trim() || null,
    };

    logger.info(`[createUser] Creating user with email: ${userData.email}`);

    //////////////////////////////////
    // Insert User: Add new user to database
    // Why: Creates new user record
    // How: Uses Supabase insert with select to return created record
    //////////////////////////////////
    const { data, error } = await supabaseAdmin
      .from('User')
      .insert(userData)
      .select()
      .single();

    //////////////////////////////////
    // Error Handling: Check for database errors
    // Why: Supabase operations can fail (duplicate email, etc.)
    // How: Log error and return null for caller to handle
    //////////////////////////////////
    if (error) {
      logger.error('[createUser] Supabase error:', error);
      
      // Check for duplicate email error
      if (error.code === '23505') { // PostgreSQL unique violation
        logger.warn(`[createUser] User with email ${email} already exists`);
      }
      
      return null;
    }

    //////////////////////////////////
    // Success: Return created user
    // Why: Caller needs the user object with generated ID
    // How: Cast data to User type (Supabase returns correct structure)
    //////////////////////////////////
    logger.info(`[createUser] Successfully created user: ${data.id}`);
    return data as User;
  } catch (error) {
    //////////////////////////////////
    // Exception Handling: Catch unexpected errors
    // Why: Network issues, type errors, etc. can occur
    // How: Log and return null
    //////////////////////////////////
    logger.error('[createUser] Unexpected error:', error);
    return null;
  }
}

/**
 * Get user by email
 * 
 * Steps:
 * 1. Connect to Supabase client
 * 2. Query User table by email
 * 3. Return first matching user or null
 * 
 * @param email - User email address
 * @returns User object or null if not found
 * 
 * @example
 * ```typescript
 * const user = await getUserByEmail({ email: 'user@example.com' });
 * if (user) {
 *   console.log('Found user:', user.id);
 * } else {
 *   console.log('User not found');
 * }
 * ```
 */
export async function getUserByEmail({
  email,
}: {
  email: string;
}): Promise<User | null> {
  try {
    //////////////////////////////////
    // Validate Input: Ensure email is provided
    // Why: Email is required for query
    //////////////////////////////////
    if (!email || email.trim() === '') {
      logger.warn('[getUserByEmail] Missing or empty email');
      return null;
    }

    logger.info(`[getUserByEmail] Fetching user with email: ${email}`);

    //////////////////////////////////
    // Query User: Search by email
    // Why: Email is unique, so we expect at most one result
    // How: Use eq() to filter by email, single() to get one result
    //////////////////////////////////
    const { data, error } = await supabaseAdmin
      .from('User')
      .select('*')
      .eq('email', email.trim())
      .single();

    //////////////////////////////////
    // Error Handling: Check for database errors
    // Why: User not found is not an error - return null
    // How: Check error code - PGRST116 means no rows found
    //////////////////////////////////
    if (error) {
      // User not found is not an error - return null
      if (error.code === 'PGRST116') {
        logger.info(`[getUserByEmail] User not found with email: ${email}`);
        return null;
      }
      
      logger.error('[getUserByEmail] Supabase error:', error);
      return null;
    }

    //////////////////////////////////
    // Success: Return found user
    // Why: Caller needs the user object
    // How: Cast data to User type
    //////////////////////////////////
    logger.info(`[getUserByEmail] Successfully found user: ${data.id}`);
    return data as User;
  } catch (error) {
    //////////////////////////////////
    // Exception Handling: Catch unexpected errors
    // Why: Network issues, type errors, etc.
    // How: Log and return null
    //////////////////////////////////
    logger.error('[getUserByEmail] Unexpected error:', error);
    return null;
  }
}

/**
 * Get user by ID
 * 
 * Steps:
 * 1. Connect to Supabase client
 * 2. Query User table by ID
 * 3. Return user or null if not found
 * 
 * @param id - User ID (UUID)
 * @returns User object or null if not found
 * 
 * @example
 * ```typescript
 * const user = await getUserById({ id: 'uuid-here' });
 * if (user) {
 *   console.log('Found user:', user.email);
 * }
 * ```
 */
export async function getUserById({
  id,
}: {
  id: string;
}): Promise<User | null> {
  try {
    //////////////////////////////////
    // Validate Input: Ensure ID is provided
    // Why: ID is required for query
    //////////////////////////////////
    if (!id || id.trim() === '') {
      logger.warn('[getUserById] Missing or empty id');
      return null;
    }

    logger.info(`[getUserById] Fetching user with id: ${id}`);

    //////////////////////////////////
    // Query User: Search by ID
    // Why: ID is primary key, so we expect at most one result
    // How: Use eq() to filter by id, single() to get one result
    //////////////////////////////////
    const { data, error } = await supabaseAdmin
      .from('User')
      .select('*')
      .eq('id', id.trim())
      .single();

    //////////////////////////////////
    // Error Handling: Check for database errors
    // Why: User not found is not an error - return null
    // How: Check error code - PGRST116 means no rows found
    //////////////////////////////////
    if (error) {
      // User not found is not an error - return null
      if (error.code === 'PGRST116') {
        logger.info(`[getUserById] User not found with id: ${id}`);
        return null;
      }
      
      logger.error('[getUserById] Supabase error:', error);
      return null;
    }

    //////////////////////////////////
    // Success: Return found user
    // Why: Caller needs the user object
    // How: Cast data to User type
    //////////////////////////////////
    logger.info(`[getUserById] Successfully found user: ${data.id}`);
    return data as User;
  } catch (error) {
    //////////////////////////////////
    // Exception Handling: Catch unexpected errors
    // Why: Network issues, type errors, etc.
    // How: Log and return null
    //////////////////////////////////
    logger.error('[getUserById] Unexpected error:', error);
    return null;
  }
}

/**
 * Get or create a constant user (for demo purposes)
 * 
 * Steps:
 * 1. Try to get existing user with constant email
 * 2. If not found, create new user
 * 3. Return user object
 * 
 * This function is used for the simplified user system where
 * we use a single constant user for all operations.
 * 
 * @returns User object (existing or newly created), or null if error
 * 
 * @example
 * ```typescript
 * const user = await getOrCreateConstantUser();
 * if (user) {
 *   console.log('Using user:', user.id);
 * } else {
 *   console.error('Failed to get or create user');
 * }
 * ```
 */
export async function getOrCreateConstantUser(): Promise<User | null> {
  //////////////////////////////////
  // Constant User Configuration: Define constant user details
  // Why: We use a single user for all operations (simplified system)
  // How: These values are used to identify/create the constant user
  //////////////////////////////////
  const CONSTANT_USER_EMAIL = 'shopmate-user@example.com';
  const CONSTANT_USER_NAME = 'ShopMate User';

  try {
    logger.info('[getOrCreateConstantUser] Attempting to get or create constant user');

    //////////////////////////////////
    // Try to Get Existing User: Check if constant user already exists
    // Why: Avoid creating duplicate users
    // How: Query by constant email
    //////////////////////////////////
    const existingUser = await getUserByEmail({ email: CONSTANT_USER_EMAIL });

    //////////////////////////////////
    // Return Existing User: If found, return it
    // Why: User already exists, no need to create
    // How: Return the found user object
    //////////////////////////////////
    if (existingUser) {
      logger.info(`[getOrCreateConstantUser] Found existing user: ${existingUser.id}`);
      return existingUser;
    }

    //////////////////////////////////
    // Create New User: User doesn't exist, create it
    // Why: First time running - need to create constant user
    // How: Use createUser function with constant values
    //////////////////////////////////
    logger.info('[getOrCreateConstantUser] Constant user not found, creating new user');
    const newUser = await createUser({
      email: CONSTANT_USER_EMAIL,
      name: CONSTANT_USER_NAME,
    });

    //////////////////////////////////
    // Return Created User: Return newly created user
    // Why: Caller needs the user object
    // How: Return result from createUser (may be null if creation failed)
    //////////////////////////////////
    if (newUser) {
      logger.info(`[getOrCreateConstantUser] Successfully created constant user: ${newUser.id}`);
    } else {
      logger.error('[getOrCreateConstantUser] Failed to create constant user');
    }

    return newUser;
  } catch (error) {
    //////////////////////////////////
    // Exception Handling: Catch unexpected errors
    // Why: Network issues, type errors, etc.
    // How: Log and return null
    //////////////////////////////////
    logger.error('[getOrCreateConstantUser] Unexpected error:', error);
    return null;
  }
}

