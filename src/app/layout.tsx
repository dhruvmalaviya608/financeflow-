import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "FinanceFlow",
  description: "Track your finances",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Google AdSense Script with your client ID */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4261185439528205"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
