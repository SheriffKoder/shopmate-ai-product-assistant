/**
 * Shadow Initial Product Data
 *
 * Purpose: Provides development-only catalog seed records for the shadow project.
 * Used in: Future /dev seed actions.
 * Used for: Keeps seed input out of public shadow page reads.
 */

import type { ShadowLocalizedList, ShadowLocaleText } from '@/shared/model/localization';

export type ShadowInitialCategory = {
  slug: string;
  name: ShadowLocaleText;
  description: ShadowLocaleText;
  sortOrder: number;
};

export type ShadowInitialProduct = {
  slug: string;
  categorySlug: string;
  name: ShadowLocaleText;
  shortDescription: ShadowLocaleText;
  description: ShadowLocaleText;
  price: number;
  rating: number;
  reviewsCount: number;
  features: ShadowLocalizedList;
  imageUrl: string | null;
  imageUrlVariations: string[];
  isFeatured: boolean;
  keywords: string[];
  colors: string[];
};

export const shadowInitialCategories: ShadowInitialCategory[] = [
  {
    slug: 'smartphone',
    name: {
      en: 'Smartphones',
      ar: 'الهواتف الذكية',
    },
    description: {
      en: 'Flagship and everyday phones for modern mobile work.',
      ar: 'هواتف رائدة ويومية للعمل والتنقل الحديث.',
    },
    sortOrder: 10,
  },
  {
    slug: 'laptop',
    name: {
      en: 'Laptops',
      ar: 'الحواسيب المحمولة',
    },
    description: {
      en: 'Portable computers for creative, professional, and everyday use.',
      ar: 'حواسيب محمولة للإبداع والعمل والاستخدام اليومي.',
    },
    sortOrder: 20,
  },
];

export const shadowInitialProducts: ShadowInitialProduct[] = [
  {
    slug: 'samsung-galaxy-s24-ultra',
    categorySlug: 'smartphone',
    name: {
      en: 'Samsung Galaxy S24 Ultra',
      ar: 'سامسونج جالاكسي S24 ألترا',
    },
    shortDescription: {
      en: 'Flagship smartphone with advanced AI features and a vivid display.',
      ar: 'هاتف رائد بميزات ذكاء اصطناعي متقدمة وشاشة زاهية.',
    },
    description: {
      en: 'A premium smartphone with a 6.8-inch AMOLED display, high-end processor, 200MP camera system, and S Pen support.',
      ar: 'هاتف فاخر بشاشة AMOLED مقاس 6.8 بوصة ومعالج قوي ونظام كاميرا 200 ميجابكسل ودعم قلم S Pen.',
    },
    price: 1199.99,
    rating: 4.8,
    reviewsCount: 2847,
    features: {
      en: ['6.8-inch AMOLED display', '200MP camera system', 'S Pen included'],
      ar: ['شاشة AMOLED مقاس 6.8 بوصة', 'نظام كاميرا 200 ميجابكسل', 'يتضمن قلم S Pen'],
    },
    imageUrl: '/images/products/samsung-galaxy-s24-ultra-removebg-preview.png',
    imageUrlVariations: [],
    isFeatured: false,
    keywords: ['samsung', 'galaxy', 's24', 'ultra', 'smartphone', 'android'],
    colors: ['black', 'titanium', 'gray'],
  },
  {
    slug: 'macbook-pro-16-m3',
    categorySlug: 'laptop',
    name: {
      en: 'MacBook Pro 16" M3 Max',
      ar: 'ماك بوك برو 16 بوصة M3 Max',
    },
    shortDescription: {
      en: 'Professional laptop with M3 Max performance for creators and developers.',
      ar: 'حاسوب محمول احترافي بأداء M3 Max للمبدعين والمطورين.',
    },
    description: {
      en: 'A professional laptop with a Liquid Retina XDR display, powerful Apple silicon, and long battery life for demanding workflows.',
      ar: 'حاسوب محمول احترافي بشاشة Liquid Retina XDR ومعالج Apple قوي وبطارية طويلة للمهام المتقدمة.',
    },
    price: 3999,
    rating: 4.9,
    reviewsCount: 892,
    features: {
      en: ['16.2-inch Liquid Retina XDR display', 'M3 Max chip', 'Long battery life'],
      ar: ['شاشة Liquid Retina XDR مقاس 16.2 بوصة', 'معالج M3 Max', 'بطارية طويلة'],
    },
    imageUrl: '/images/products/macbook-pro-16-m3-removebg-preview.png',
    imageUrlVariations: [
      '/images/products/macbook-pro-16-m3-1.jpg',
      '/images/products/macbook-pro-16-m3-2.jpg',
      '/images/products/macbook-pro-16-m3-3.jpg',
    ],
    isFeatured: true,
    keywords: ['macbook', 'pro', 'm3', 'laptop', 'apple'],
    colors: ['space gray', 'silver'],
  },
];
