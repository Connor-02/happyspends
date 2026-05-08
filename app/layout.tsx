import type { Metadata, Viewport } from 'next';
import './globals.css';
import { StoreProvider } from '@/components/providers/StoreProvider';

export const metadata: Metadata = {
  title: 'HappySpends — Personal Budgeting',
  description: 'A modern PWA budgeting app. Simple, smart, private.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HappySpends',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
    icon: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#ec4899',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
