import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/ToastProvider";
import { GlobalLoaderProvider } from "@/components/GlobalLoader";
import Footer from "@/components/Footer";
import PendingCartHandler from "@/components/PendingCartHandler";
import LanguageStoreHydration from "@/components/LanguageStoreHydration";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Norway | Greennex",
  description: "Sustainable products for a greener future",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Read from sessionStorage for current session language
                  // This runs before React loads to prevent flash of wrong language
                  var stored = sessionStorage.getItem('language-preference');
                  if (stored === 'en' || stored === 'no') {
                    // User switched language during session - use their choice
                    document.documentElement.setAttribute('data-language', stored);
                  } else {
                    // First visit or new session - always default to Norwegian
                    document.documentElement.setAttribute('data-language', 'no');
                  }
                  // Hide body until React hydrates to prevent flash
                  document.documentElement.classList.add('hydrating');
                } catch (e) {
                  // Default to Norwegian on error (private browsing, etc.)
                  document.documentElement.setAttribute('data-language', 'no');
                  document.documentElement.classList.add('hydrating');
                }
              })();
            `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html.hydrating body {
                visibility: hidden;
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <GlobalLoaderProvider>
          <ToastProvider>
            <LanguageStoreHydration />
            <PendingCartHandler />
            <Navbar />
            <main className="min-h-screen pb-12">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </GlobalLoaderProvider>
      </body>
    </html>
  );
}
