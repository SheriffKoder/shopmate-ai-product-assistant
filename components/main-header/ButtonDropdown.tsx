"use client"
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LucideIcon } from 'lucide-react'
import { CartAction } from '@/features/shop/model/cart'
import { CartItemCard } from '../../features/shop-assistant/tools/cart-info/cart-item-card'
import { Button } from '@/components/ui/button'
import { HeaderIconButton } from './HeaderIconButton'

interface ButtonDropdownItem {
  id: string;
  title: string;
  description?: string;
  badge?: string;
  price?: number;
  quantity?: number;
  image?: string;
  onClick?: () => void;
  productId?: string; // For cart actions
}

interface ButtonDropdownProps {
  icon: LucideIcon;
  items: ButtonDropdownItem[];
  badgeCount?: number;
  className?: string;
  headerTitle?: string;
  tooltip?: string;
  dispatchCartAction?: (action: CartAction) => void; // Optional cart dispatch function
}

const ButtonDropdown = ({ icon: Icon, items, badgeCount, className = "", headerTitle, tooltip, dispatchCartAction }: ButtonDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Calculate total price from items
  const totalPrice = items.reduce((sum, item) => {
    return sum + ((item.price || 0) * (item.quantity || 1));
  }, 0);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <HeaderIconButton
        icon={Icon}
        onClick={() => setIsOpen(!isOpen)}
        badgeCount={badgeCount}
        className={className}
        tooltip={tooltip}
        isActive={isOpen}
      />

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[320px] bg-[#191919]/20 backdrop-blur-xl rounded-lg border border-white/20 shadow-lg z-50 overflow-hidden">
          {headerTitle && (
            <div className="px-4 py-3 border-b border-white/10 bg-gradient-to-r from-primary to-secondary">
              <h3 className="text-sm font-semibold text-white">{headerTitle}</h3>
            </div>
          )}
          <div className="max-h-[400px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-white/60 text-sm">
                Your cart is empty
              </div>
            ) : (
              <>
                {items.map((item) => (
                  <CartItemCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    description={item.description}
                    badge={item.badge}
                    price={item.price}
                    quantity={item.quantity}
                    image={item.image}
                    productId={item.productId}
                    dispatchCartAction={dispatchCartAction}
                  />
                ))}
              </>
            )}
          </div>
          
          {/* Total Price and Checkout Button */}
          {items.length > 0 && (
            <div className="border-t border-white/10 px-4 py-3 space-y-3 bg-white">
              {/* Total Price */}
              <div className="flex justify-between items-center">
                <span className="text-black font-semibold text-lg">Total:</span>
                <span className="text-black font-bold text-xl">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>

              {/* Checkout Button */}
              <Button
                className="cursor-pointer w-full bg-gradient-to-r from-primary to-secondary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                onClick={() => {
                  router.push('/checkout');
                  setIsOpen(false);
                }}
              >
                Checkout
              </Button>

              {/* Go to Cart Button */}
              <Button
                variant="outline"
                className="cursor-pointer w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2 px-4 rounded-lg transition-colors"
                onClick={() => {
                  router.push('/cart');
                  setIsOpen(false);
                }}
              >
                Go to Cart
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ButtonDropdown;
