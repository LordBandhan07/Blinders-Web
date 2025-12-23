import type { Metadata, Viewport } from "next";
import "./globals.css";
import Script from "next/script";

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
        url: '/blinders-logo.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/blinders-logo.png',
        type: 'image/png',
        sizes: '192x192',
      },
    ],
    apple: [
      {
        url: '/blinders-logo.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcut: '/blinders-logo.png',
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
        <link rel="apple-touch-icon" href="/blinders-logo.png" />
        <link rel="icon" type="image/svg+xml" href="/blinders-logo.svg" />
        <link rel="icon" type="image/png" href="/blinders-logo.png" />
      </head>
      <body>
        {children}

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
