import type { Metadata, Viewport } from "next";
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Property Price Predictor",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#ffffff",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta name="color-scheme" content="light dark" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
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
          <div className="mx-auto w-full">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}