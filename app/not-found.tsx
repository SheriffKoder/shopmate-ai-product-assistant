/**
 * Not Found Page (404)
 * 
 * Purpose: Displays when a page is not found
 * Used in: Next.js routing (automatic 404 handling)
 * Why: Provides a user-friendly error page for missing routes
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        {/* 404 Number */}
        <div className="text-9xl font-bold text-gray-200 dark:text-gray-800">
          404
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
          <Link href="/" className="flex-1">
            <Button className="cursor-pointer w-full bg-gradient-to-r from-primary to-secondary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Link href="/products" className="flex-1">
            <Button
              variant="outline"
              className="cursor-pointer w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <Search className="w-4 h-4 mr-2" />
              Browse Products
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
}

