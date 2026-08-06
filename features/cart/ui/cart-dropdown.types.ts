import type { LucideIcon } from 'lucide-react';

export interface CartDropdownItem {
  id: string;
  title: string;
  description?: string;
  badge?: string;
  price?: number;
  quantity?: number;
  image?: string;
  productId?: string;
}

export interface CartDropdownProps {
  icon: LucideIcon;
  label?: string;
  items: CartDropdownItem[];
  badgeCount?: number;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  headerTitle?: string;
  tooltip?: string;
  removeItem?: (productId: string) => Promise<void>;
  decreaseQuantity?: (productId: string) => Promise<void>;
  increaseQuantity?: (productId: string) => Promise<void>;
}
