/**
 * Promotional Cards Configuration
 * 
 * Purpose: Defines promotional card configurations for featured products
 * Used in: PromotionalCards component
 * Why: Centralizes promotional card data for easier management
 */

export interface PromotionalCardConfig {
  header: string; // Product name/header
  catchyText: string; // Description or catchy text
  buttonText: string; // Button label
  backgroundColor1: string; // Background gradient color 1 (CSS color value)
  backgroundColor2: string; // Background gradient color 2 (CSS color value)
  accentColor: string; // Accent color for price and button (CSS color value)
  productId: string; // Product ID to fetch image_url
}

/**
 * Get promotional card configurations
 * @returns Array of promotional card configs
 */
export function getPromotionalCardConfigs(): PromotionalCardConfig[] {
  return [
    {
      header: 'Dell XPS 15 9530',
      catchyText: 'Premium Windows laptop with OLED display and powerful performance',
      buttonText: 'SHOP NOW',
      backgroundColor1: '#35927d', // Black background
      backgroundColor2: '#3e716a', // Black background
      accentColor: '#8ac8bd', // Black background
      productId: 'dell-xps-15-9530',
    },
    {
      header: 'MacBook Pro 16" M3 Max',
      catchyText: 'Professional laptop with M3 Max chip for creators and developers',
      buttonText: 'SHOP NOW',
      backgroundColor1: '#303136', // Black background
      backgroundColor2: '#0c0d0f', // Black background
      accentColor: '#6a6d76', // Black background
      productId: 'macbook-pro-16-m3',
    },
  ];
}

