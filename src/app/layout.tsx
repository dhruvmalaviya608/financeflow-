
import type {Metadata} from 'next';
import './globals.css';
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/layout/theme-provider';
import { ClickSoundProvider } from '@/components/click-sound-provider';

export const metadata: Metadata = {
  title: 'FinanceFlow',
  description: 'Your personal finance tracker.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased", "bg-background")}>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
          <ClickSoundProvider>
            {children}
          </ClickSoundProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
