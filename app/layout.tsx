import type { Metadata } from "next";
import "./globals.css";
import localFont from 'next/font/local';
import { LayoutWrapper } from '@/components/layout-wrapper';

// Local Fonts  
// 1. import, 2. add to body, 3. add to tailwind config
// 4. use as a className as. font-ogg-reg
const OggRegular = localFont({
  src: [
    {
      path: '../public/fonts/Ogg-Regular-BF646c18fc465e5.ttf',
    },
  ],
  variable: '--font-ogg-reg'
})

export const metadata: Metadata = {
  title: "ShopMate AI - Your Intelligent Shopping Assistant",
  description: "Discover the best electronic products with ShopMate AI. Get personalized product recommendations, compare features, and shop smart with our AI-powered shopping assistant.",
  keywords: ["electronics", "shopping", "AI assistant", "product recommendations", "online store"],
  authors: [{ name: "ShopMate AI" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${OggRegular.variable} relative min-h-[100vh] cf2`}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
