/**
 * Promotional Cards Component
 * 
 * Purpose: Displays promotional cards based on configuration
 * Used in: app/page.tsx
 * Why: Separates promotional cards logic into a reusable component
 */

'use client';

import React from 'react';
import { useProducts } from '@/features/catalog/hooks/use-products';
import { getPromotionalCardConfigs } from '@/views/home/config/promotional-cards';
import { PromotionalCard } from './PromotionalCard';

interface PromotionalCardsProps {
  onProductClick?: (productId: string) => void;
}

export const PromotionalCards = ({ onProductClick }: PromotionalCardsProps) => {
  const { products } = useProducts();
  const configs = getPromotionalCardConfigs();

  return (
    <div className="w-full px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {configs.map((config) => {
          const product = products.find((p) => p.id === config.productId) || null;
          return (
            <PromotionalCard
              key={config.productId}
              config={config}
              product={product}
              onButtonClick={onProductClick}
            />
          );
        })}
      </div>
    </div>
  );
};
