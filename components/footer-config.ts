/**
 * Footer Configuration
 *
 * Purpose: Defines footer content and structure for the app shell footer.
 * Used in: components/footer.tsx
 * Used for: Keeps footer display copy close to the shell instead of page views.
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
 * Get footer configuration.
 *
 * @returns Footer configuration object.
 */
export function getFooterConfig(): FooterConfig {
  return {
    company: {
      name: 'ShopMate AI',
      description:
        'Your trusted AI-powered shopping assistant. Discover the best electronic products with personalized recommendations and expert guidance.',
    },
    social: [
      { name: 'Facebook', href: 'https://facebook.com' },
      { name: 'Twitter', href: 'https://twitter.com' },
      { name: 'Instagram', href: 'https://instagram.com' },
      { name: 'LinkedIn', href: 'https://linkedin.com' },
    ],
    links: {
      product: [
        { name: 'All Products', href: '/en/products' },
        { name: 'Featured', href: '/en/products' },
        { name: 'New Arrivals', href: '/en/products' },
        { name: 'Sale', href: '/en/products' },
      ],
    },
    newsletter: {
      title: 'Subscribe to our newsletter',
      description: 'Get the latest updates on new products, special offers, and exclusive deals.',
      placeholder: 'Enter your email',
      button: 'Subscribe',
    },
  };
}
