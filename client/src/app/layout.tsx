import InitializeAuth from "@/components/auth/InitializeAuth";
import { Toaster } from "@/components/ui/toaster";
import { ThemeModeScript } from "flowbite-react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Survista", 
  description: "Survey Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeModeScript />
      </head>
      <body className={inter.className}>
        <InitializeAuth />
        {children}
        <Toaster />
      </body>
    </html>
  );
}


