import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./CartContext";
import CartSidebar from "./CartSidebar";
import ControlPanel from "./ControlPanel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fuddi",
  description: "Catálogo Fuddi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Bootstrap Icons CDN */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css"
        />
        {/* Google Fonts para Homemade Apple */}
        <link
          href="https://fonts.googleapis.com/css?family=Homemade+Apple&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <CartProvider>
          {children}
          <CartSidebar />
        </CartProvider>
        <ControlPanel />
      </body>
    </html>
  );
}
