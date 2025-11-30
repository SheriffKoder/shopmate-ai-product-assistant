/**
 * Footer Configuration
 * 
 * Purpose: Defines footer content and structure
 * Used in: components/footer.tsx
 * Why: Centralizes footer data for easier management
 */

export interface FooterLink {
  name: string;
  href: string;
}

export interface FooterConfig {
  company: {
    name: string;
    description: string;
  };
  social: Array<{
    name: string;
    href: string;
  }>;
  links: {
    product: FooterLink[];
  };
  newsletter: {
    title: string;
    description: string;
    placeholder: string;
    button: string;
  };
}

/**
 * Get footer configuration
 * @returns Footer configuration object
 */
export function getFooterConfig(): FooterConfig {
  return {
    company: {
      name: 'ShopMate AI',
      description: 'Your trusted AI-powered shopping assistant. Discover the best electronic products with personalized recommendations and expert guidance.',
    },
    social: [
      { name: 'Facebook', href: 'https://facebook.com' },
      { name: 'Twitter', href: 'https://twitter.com' },
      { name: 'Instagram', href: 'https://instagram.com' },
      { name: 'LinkedIn', href: 'https://linkedin.com' },
    ],
    links: {
      product: [
        { name: 'All Products', href: '/products' },
        { name: 'Featured', href: '/featured' },
        { name: 'New Arrivals', href: '/new' },
        { name: 'Sale', href: '/sale' },
      ]
    },
    newsletter: {
      title: 'Subscribe to our newsletter',
      description: 'Get the latest updates on new products, special offers, and exclusive deals.',
      placeholder: 'Enter your email',
      button: 'Subscribe',
    },
  };
}

