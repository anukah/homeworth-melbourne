import type { Metadata } from "next";
import localFont from "next/font/local";
import "../globals.css";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Property Price Predictor",
  description: "Get accurate property price predictions based on suburb data",
  viewport: {
    width: "device-width",
    initialScale: 1,
    minimumScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: "#ffffff",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Property Price Predictor",
  },
  formatDetection: {
    telephone: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta name="color-scheme" content="light dark" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          font-sans
          min-h-screen 
          w-full 
          flex 
          flex-col 
          bg-gray-50
          text-zinc-900
          antialiased
          overflow-x-hidden
          selection:bg-blue-100
          selection:text-blue-900
        `}
      >
        <main className="flex-1 relative">
          {/* Add a max-width container but allow full-bleed sections */}
          <div className="mx-auto w-full">
            {children}
          </div>
        </main>

        {/* Optional footer - uncomment if needed */}
        {/* <footer className="w-full border-t border-gray-200 bg-white py-4">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} Property Price Predictor. All rights reserved.
            </p>
          </div>
        </footer> */}
      </body>
    </html>
  );
}