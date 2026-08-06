import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Instrument_Serif, Roboto } from 'next/font/google';
import { LayoutWrapper } from '@/components/layout-wrapper';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-instrument-serif',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: "ShopMate AI - Your Intelligent Shopping Assistant",
  description: "Discover the best electronic products with ShopMate AI. Get personalized product recommendations, compare features, and shop smart with our AI-powered shopping assistant.",
  keywords: ["electronics", "shopping", "AI assistant", "product recommendations", "online store"],
  authors: [{ name: "ShopMate AI" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${instrumentSerif.variable} ${roboto.variable} relative min-h-[100vh]`}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
