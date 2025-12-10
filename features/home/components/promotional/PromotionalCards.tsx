/**
 * Promotional Cards Component
 * 
 * Purpose: Displays promotional cards based on configuration
 * Used in: app/page.tsx
 * Why: Separates promotional cards logic into a reusable component
 */

'use client';

import React from 'react';
import { useShop } from '@/features/ai-assistant/providers/shop-context';
import { getPromotionalCardConfigs } from '@/features/home/config/promotional-cards';
import { PromotionalCard } from './PromotionalCard';

interface PromotionalCardsProps {
  onProductClick?: (productId: string) => void;
}

export const PromotionalCards = ({ onProductClick }: PromotionalCardsProps) => {
  const { products } = useShop();
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

