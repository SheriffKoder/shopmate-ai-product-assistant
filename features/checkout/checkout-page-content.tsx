/**
 * Checkout Page Content Component
 * 
 * Purpose: Client component that displays order confirmation
 * Used in: app/checkout/page.tsx
 * Why: Separates client-side logic from server component page
 */

'use client';

import { BadgeCheck, ArrowLeft, MapPin, Phone, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CheckoutPageContent() {
  const router = useRouter();

  // Dummy order information
  const orderInfo = {
    orderNumber: 'ORD-2026-001234',
    customerName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    shippingAddress: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States'
    },
    estimatedDelivery: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  };

  return (
    <div className="w-full min-h-screen flex flex-col gap-6 p-4 pt-6">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order Confirmation</h1>
        </div>

        {/* Confirmation Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 space-y-6">
          {/* Success Icon and Message */}
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <BadgeCheck className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Order Confirmed!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-2">
              Thank you for your purchase. Your order has been received and is being processed.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 font-medium">
              Order Number: {orderInfo.orderNumber}
            </p>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          {/* Order Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Order Details
            </h3>

            {/* Customer Information */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Customer Name</p>
                  <p className="text-gray-900 dark:text-white font-medium">{orderInfo.customerName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{orderInfo.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                  <p className="text-gray-900 dark:text-white font-medium">{orderInfo.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Shipping Address</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {orderInfo.shippingAddress.street}
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {orderInfo.shippingAddress.city}, {orderInfo.shippingAddress.state} {orderInfo.shippingAddress.zipCode}
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {orderInfo.shippingAddress.country}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estimated Delivery */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-white">Estimated Delivery:</span>{' '}
              {orderInfo.estimatedDelivery}
            </p>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/products" className="flex-1">
              <Button
                variant="outline"
                className="cursor-pointer w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Continue Shopping
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button
                className="cursor-pointer w-full bg-gradient-to-r from-primary to-secondary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

