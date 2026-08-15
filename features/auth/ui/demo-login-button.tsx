/**
 * Demo Login Button
 *
 * Purpose: Loads the configured development user into the browser assistant session.
 * Used in: Auth-facing controls such as the app header.
 * Used for: Providing an explicit demo login without exposing the demo password.
 */

'use client';

import { useUserSession } from '@/features/ai-assistant/providers/user-session-context';

/** Renders a reusable button for loading the server-configured demo user. */
export function DemoLoginButton() {
  const { user, isLoading, loadUser, clearUser } = useUserSession();

  async function handleDemoLogin() {
    if (user) {
      clearUser();
      return;
    }

    await loadUser();
  }

  return (
    <button
      type="button"
      onClick={handleDemoLogin}
      disabled={isLoading}
      className="w-full rounded-md bg-gray-950 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Toggle demo user ({user ? 'on' : 'off'}) {isLoading ? 'loading' : ''}
    </button>
  );
}
