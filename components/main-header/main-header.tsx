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
import { MessageCircle, ShoppingCart, User } from 'lucide-react';
import ButtonDropdown from '@/features/cart/ui/cart-dropdown';
import { HeaderIconButton } from './HeaderIconButton';
import { HeaderSearchBar } from './HeaderSearchBar';
import { useCart } from '@/features/cart/hooks/use-cart';
import { navigateToProductSearch } from './lib/navigation-utils';
import { useAssistantShell } from '@/features/ai-assistant/providers/assistant-shell-context';

export const MainHeader = () => {
  const router = useRouter();
  const { isOpen: isAssistantOpen, toggleAssistant } = useAssistantShell();
  
  // Shop Context: Provides cart state and operations
  // Why: Centralized state management, eliminates prop drilling
  //////////////////////////////////
  const { cart, removeItem, decreaseQuantity, increaseQuantity } = useCart();

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

        <HeaderIconButton
          icon={MessageCircle}
          tooltip={isAssistantOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
          onClick={toggleAssistant}
          isActive={isAssistantOpen}
          inactiveClassName="bg-black text-primary"
          activeClassName="bg-primary text-black"
        />

        {/* Shopping Cart */}
        <ButtonDropdown 
          icon={ShoppingCart} 
          items={cartItems}
          badgeCount={cart.totalItems}
          className=""
          headerTitle="Shopping Cart"
          tooltip="Shopping Cart"
          removeItem={removeItem}
          decreaseQuantity={decreaseQuantity}
          increaseQuantity={increaseQuantity}
        />

      </div>
    </div>
  );
};
