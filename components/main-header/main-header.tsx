/**
 * Main Header Component
 * 
 * Purpose: Displays the main header with AI assistant branding and action buttons
 * Used in: app/page.tsx
 * Why: Separates header UI logic from the main page component
 */

'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Home, User } from 'lucide-react';
import ButtonDropdown from './ButtonDropdown';
import { HeaderIconButton } from './HeaderIconButton';
import { HeaderSearchBar } from './HeaderSearchBar';
import { useShop } from '@/features/ai-assistant/providers/shop-context';
import { navigateToProductSearch } from '@/features/products/utils/navigation-utils';

interface MainHeaderProps {
  onChatToggle?: () => void;
  isChatOpen?: boolean;
}

export const MainHeader = ({ onChatToggle, isChatOpen = false }: MainHeaderProps) => {
  const router = useRouter();
  
  // Shop Context: Provides cart state and operations
  // Why: Centralized state management, eliminates prop drilling
  //////////////////////////////////
  const { cart, dispatchCartAction } = useShop();

  const handleSearch = (query: string) => {
    navigateToProductSearch(router, query);
  };
  
  // Convert cart items to ButtonDropdown items
  const cartItems = cart.items.map((item) => ({
    id: item.productId,
    title: item.product.name,
    description: item.product.shortDescription,
    badge: item.quantity > 1 ? `Qty: ${item.quantity}` : undefined,
    price: item.product.price,
    quantity: item.quantity,
    productId: item.productId, // Pass productId for cart actions
    image: item.product.image_url || undefined, // Use image_url from product
  }));
  
  return (
    <div className='fixed top-0 left-0 w-full h-[70px] bg-white flex flex-row items-center justify-between px-4 z-50'>
      
      <div className='cursor-pointer flex flex-row items-center gap-2 mb-2'>
        <Image src='/images/icon.png' alt='ShopMate AI' width={30} height={30}
        onClick={() => router.push('/')} />
        {/* <span className='text-black text-lg font-bold hidden md:block'>ShopMate AI</span> */}
      </div>

      <div className='flex flex-1 items-center justify-center'>
        <HeaderSearchBar
          onSearch={handleSearch}
          placeholder="Search products..."
        />
      </div>
      

      <div className='flex flex-row items-center gap-4'>
        <HeaderIconButton
          icon={User}
          tooltip="User Account"
          onClick={() => {
            // Handle user account - can be implemented later
            console.log('User clicked');
          }}
        />

        {/* Shopping Cart */}
        <ButtonDropdown 
          icon={ShoppingCart} 
          items={cartItems}
          badgeCount={cart.totalItems}
          className=""
          headerTitle="Shopping Cart"
          tooltip="Shopping Cart"
          dispatchCartAction={dispatchCartAction}
        />

        {/* ShopMate AI Chat Toggle Button */}
        <button
          onClick={onChatToggle}
          className={`cursor-pointer hidden md:flex flex-row items-center gap-2 px-4 py-2 rounded-sm font-semibold transition-colors ${
            isChatOpen 
              ? 'bg-primary text-white hover:bg-primary/90' 
              : 'bg-gray-100 text-black hover:bg-gray-200'
          }`}
        >
          <Image src="/images/icon.png" alt="ShopMate AI" width={20} height={20} />
          <span>ShopMate AI</span>
        </button>

      </div>
    </div>
  );
};

