import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';
import CookieConsent from "@/components/Cookies";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_PRODUCTNAME || "Drone Flight Dashboard",
  description: "Real-time drone flight analytics and performance monitoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body>
      {children}
      <Analytics />
      <CookieConsent />
    </body>
    </html>
  );
}
