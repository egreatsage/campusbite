import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar"; // <-- Import the Navbar

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CampusBite | Campus Food Ordering",
  description: "Fast, simple campus food ordering.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <Navbar /> {/* <-- Place it above the children */}
        <Toaster position="top-center" />
        <main>{children}</main>
      </body>
    </html>
  );
}