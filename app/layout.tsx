import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/ToastProvider";
import { GlobalLoaderProvider } from "@/components/GlobalLoader";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Norwa - Nature-Friendly E-Commerce",
  description: "Sustainable products for a greener future",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GlobalLoaderProvider>
          <ToastProvider>
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
