// 1. Import the Inter font
import { Inter } from "next/font/google"; 

import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import FloatingCart from "./components/FloatingCart";

// 2. Initialize the font (This is what your code was missing)
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CampusBite | Campus Food Ordering",
  description: "Fast, simple campus food ordering.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* 3. Now 'inter.className' will work perfectly */}
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <Navbar />
        <Toaster position="top-center" />
        <main>{children}</main>
        <FloatingCart />
      </body>
    </html>
  );
}