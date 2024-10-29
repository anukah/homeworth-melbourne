import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Property Price Predictor",
  description: "Predict property prices in your area",
  authors: [{ name: "Your Name" }],
  keywords: ["property", "real estate", "price prediction", "housing market"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          font-sans
          min-h-screen 
          w-full 
          antialiased 
          flex 
          flex-col 
          overflow-x-hidden
          selection:bg-gray-200
          text-base
          md:text-[16px]
          lg:text-[18px]
          bg-gray-50
          dark:bg-gray-900
          dark:text-white
          transition-colors
          duration-200
        `}
      >
        <main className="flex-1 mx-auto w-full max-w-screen-2xl px-4 sm:px-6 md:px-8">
          {children}
        </main>

        <footer className="w-full py-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Property Price Predictor. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}