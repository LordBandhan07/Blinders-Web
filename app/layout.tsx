import type { Metadata, Viewport } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import Script from "next/script";
import { Toaster } from 'react-hot-toast';
import InstallPrompt from './components/InstallPrompt';
import DisableContextMenu from './components/DisableContextMenu';
import SessionMonitor from './components/SessionMonitor';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Blinders - The Future Agents",
  description: "Secure communication platform for authorized Blinders agents only",
  applicationName: "Blinders",
  authors: [{ name: "Blinders Organization" }],
  keywords: ["blinders", "secure chat", "encrypted messaging", "private communication"],
  creator: "Blinders Organization",
  publisher: "Blinders Organization",
  icons: {
    icon: [
      {
        url: '/icons/icon-192x192.png',
        type: 'image/png',
        sizes: '192x192',
      },
      {
        url: '/icons/icon-512x512.png',
        type: 'image/png',
        sizes: '512x512',
      },
    ],
    apple: [
      {
        url: '/icons/icon-192x192.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcut: '/icons/icon-192x192.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Blinders',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Blinders - The Future Agents',
    title: 'Blinders - The Future Agents',
    description: 'Secure communication platform for authorized Blinders agents',
    images: [
      {
        url: '/blinders-logo.png',
        width: 1200,
        height: 630,
        alt: 'Blinders Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blinders - The Future Agents',
    description: 'Secure communication platform for authorized Blinders agents',
    images: ['/blinders-logo.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFC107' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Blinders" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" href="/icons/icon-192x192.png" />
      </head>
      <body>
        <DisableContextMenu>
          <SessionMonitor />
          {children}
        </DisableContextMenu>

        {/* PWA Install Prompt Script */}
        <Script id="pwa-install" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('ServiceWorker registration successful');
                  },
                  function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  }
                );
              });
            }
            
            let deferredPrompt;
            window.addEventListener('beforeinstallprompt', (e) => {
              e.preventDefault();
              deferredPrompt = e;
              console.log('PWA install prompt ready');
            });
          `}
        </Script>
      </body>
    </html>
  );
}
