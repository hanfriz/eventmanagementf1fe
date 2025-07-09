import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Header from "@/components/layout/Header";
import Providers from "@/lib/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Event Management - Discover Amazing Events",
  description:
    "Find, book, and manage events with our comprehensive event management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 bg-white">{children}</main>
            <footer className="bg-gray-900 text-white py-8">
              <div className="container mx-auto px-4 text-center">
                <p>&copy; 2025 Event Management. All rights reserved.</p>
              </div>
            </footer>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
