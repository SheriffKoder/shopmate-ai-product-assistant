/**
 * Home Main Content Component
 * 
 * Purpose: Main content layout for the home page
 * Used in: app/page.tsx
 * Why: Separates home page content logic into a reusable component
 */

'use client';

import { HeaderCategories } from './components/categories/HeaderCategories';
import { BannerSlider } from './components/banner/BannerSlider';
import { PromotionalCards } from './components/promotional/PromotionalCards';

export const Home = () => {
  return (
    <div className="flex flex-1 h-full ] p-4 flex-col gap-4">
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='col-span-1 md:col-span-1'>
          <HeaderCategories />
        </div>
        <div className='col-span-1 md:col-span-3'>
          <BannerSlider />
        </div>
      </div>
      {/* <ProductGrid /> */}
      {/* <NonFeaturedProductsGrid /> */}
      <PromotionalCards />
    </div>
  );
};

