/**
 * Home Page
 * 
 * Purpose: Main entry point for the home page
 * Used in: Next.js routing
 * Why: Simple wrapper for the Home component
 */

import { Home } from '@/features/home/index';

export default function HomePage() {
    return <Home />;
}

