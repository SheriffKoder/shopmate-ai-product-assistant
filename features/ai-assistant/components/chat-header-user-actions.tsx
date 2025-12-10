/**
 * Chat Header User Actions Component
 * 
 * Purpose: User action buttons for chat header (create/load user)
 * Used in: chat-wrapper.tsx
 * Why: Separates user management UI from chat wrapper logic
 * 
 * How it works:
 * 1. Uses useUserSession hook to manage user state
 * 2. Provides cloud-upload (create) and cloud-download (load) buttons
 * 3. Shows toast notifications for success/error states
 * 4. Handles loading states during API calls
 * 
 * Steps:
 * 1. Get user session state and functions from hook
 * 2. Handle create user click (cloud-upload icon)
 * 3. Handle load user click (cloud-download icon)
 * 4. Show appropriate toast notifications
 */

'use client';

import { CloudUpload, CloudDownload } from 'lucide-react';
import { useUserSession } from '@/features/ai-assistant/hooks/use-user-session';
import { useToast } from '@/features/toast-success/use-toast';

/**
 * Chat Header User Actions Component Props
 */
interface ChatHeaderUserActionsProps {
  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * Chat Header User Actions Component
 * 
 * Displays user action buttons (create/load) in the chat header.
 * Buttons are placed beside the chevron icon.
 * 
 * Features:
 * - Cloud Upload button: Creates constant user in database
 * - Cloud Download button: Loads constant user from database
 * - Toast notifications for success/error
 * - Loading states during API calls
 * - Prevents event propagation (doesn't trigger collapse)
 * 
 * @param className - Optional additional CSS classes
 * 
 * @example
 * ```tsx
 * <ChatHeaderUserActions />
 * ```
 */
export function ChatHeaderUserActions({ className = '' }: ChatHeaderUserActionsProps) {
  //////////////////////////////////
  // User Session: Get user state and management functions
  // Why: Need to create/load user and check current state
  // How: useUserSession hook provides user, isLoading, createUser, loadUser
  //////////////////////////////////
  const { user, isLoading, createUser, loadUser } = useUserSession();

  //////////////////////////////////
  // Toast Hook: Get toast notification methods
  // Why: Show success/error messages to user
  // How: useToast hook provides showSuccess and showError methods
  //////////////////////////////////
  const { showSuccess, showError } = useToast();

  /**
   * Handle Create User Click (Cloud Upload Button)
   * 
   * Steps:
   * 1. Call createUser function (gets or creates constant user)
   * 2. Show success toast if successful
   * 3. Show error toast if failed
   * 
   * Why: User clicked cloud-upload icon to create user in database
   * How: Calls API via useUserSession hook
   */
  const handleCreateUser = async () => {
    try {
      //////////////////////////////////
      // Create User: Call API to get or create constant user
      // Why: Create user in database for persistence
      // How: createUser function from hook calls /api/user?constant=true
      //////////////////////////////////
      const newUser = await createUser();

      //////////////////////////////////
      // Success Handling: User created successfully
      // Why: Inform user of success
      // How: Show success toast notification
      //////////////////////////////////
      if (newUser) {
        showSuccess(
          `User created successfully!`,
          'User Initialized',
          3000
        );
      } else {
        //////////////////////////////////
        // Error Handling: User creation failed
        // Why: Inform user of failure
        // How: Show error toast notification
        //////////////////////////////////
        showError(
          'Failed to create user. Please try again.',
          'User Creation Failed',
          4000
        );
      }
    } catch (error) {
      //////////////////////////////////
      // Exception Handling: Unexpected error
      // Why: Catch any unexpected errors
      // How: Log and show error toast
      //////////////////////////////////
      console.error('[ChatHeaderUserActions] Error creating user:', error);
      showError(
        'An unexpected error occurred while creating user.',
        'Error',
        4000
      );
    }
  };

  /**
   * Handle Load User Click (Cloud Download Button)
   * 
   * Steps:
   * 1. Call loadUser function (gets constant user from API)
   * 2. Show success toast if successful
   * 3. Show error toast if failed
   * 
   * Why: User clicked cloud-download icon to load user from database
   * How: Calls API via useUserSession hook
   */
  const handleLoadUser = async () => {
    try {
      //////////////////////////////////
      // Load User: Call API to get constant user
      // Why: Load user from database
      // How: loadUser function from hook calls /api/user?constant=true
      //////////////////////////////////
      const loadedUser = await loadUser();

      //////////////////////////////////
      // Success Handling: User loaded successfully
      // Why: Inform user of success
      // How: Show success toast notification
      //////////////////////////////////
      if (loadedUser) {
        showSuccess(
          `User loaded successfully!`,
          'User Session Restored',
          3000
        );
      } else {
        //////////////////////////////////
        // Error Handling: User loading failed
        // Why: Inform user of failure
        // How: Show error toast notification
        //////////////////////////////////
        showError(
          'Failed to load user. Please try again.',
          'User Loading Failed',
          4000
        );
      }
    } catch (error) {
      //////////////////////////////////
      // Exception Handling: Unexpected error
      // Why: Catch any unexpected errors
      // How: Log and show error toast
      //////////////////////////////////
      console.error('[ChatHeaderUserActions] Error loading user:', error);
      showError(
        'An unexpected error occurred while loading user.',
        'Error',
        4000
      );
    }
  };

  return (
    <div className={`flex flex-row items-center gap-2 ${className}`}>
      {/* Cloud Upload Button: Create User */}
      <button
        onClick={(e) => {
          //////////////////////////////////
          // Prevent Event Propagation: Stop click from triggering collapse
          // Why: Button is inside clickable header, don't want to collapse chat
          // How: e.stopPropagation()
          //////////////////////////////////
          e.stopPropagation();
          handleCreateUser();
        }}
        disabled={isLoading}
        className={`
          p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          ${user ? 'opacity-70' : 'opacity-100'}
        `}
        aria-label="Create user in database"
        title={user ? 'User already exists' : 'Create user in database'}
      >
        <CloudUpload 
          className="w-4 h-4 text-white" 
          aria-hidden="true"
        />
      </button>

      {/* Cloud Download Button: Load User */}
      <button
        onClick={(e) => {
          //////////////////////////////////
          // Prevent Event Propagation: Stop click from triggering collapse
          // Why: Button is inside clickable header, don't want to collapse chat
          // How: e.stopPropagation()
          //////////////////////////////////
          e.stopPropagation();
          handleLoadUser();
        }}
        disabled={isLoading}
        className={`
          p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        aria-label="Load user from database"
        title="Load user from database"
      >
        <CloudDownload 
          className="w-4 h-4 text-white" 
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

