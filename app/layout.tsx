import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Instrument_Serif, Roboto } from 'next/font/google';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { SEO_SITE_DESCRIPTION, SEO_SITE_NAME, SEO_SITE_URL } from '@/shared/seo/config';

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
  metadataBase: new URL(SEO_SITE_URL),
  title: SEO_SITE_NAME,
  description: SEO_SITE_DESCRIPTION,
  authors: [{ name: SEO_SITE_NAME }],
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
