import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "FinanceFlow",
  description: "Track your finances",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Google AdSense Plain Script (NO Next.js <Script /> here) */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4261185439528205"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
