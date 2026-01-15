import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MobileShell from "../components/layout/MobileShell";

const inter = Inter({ subsets: ["latin"] });

// 1. The Mobile Settings (Locks zoom, handles notch)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

// 2. The App Metadata (SEO + Apple Settings)
export const metadata: Metadata = {
  title: "FlowState.os",
  description: "The Operating System for Deep Work",
  manifest: "/manifest.json", // <--- Links your new ID card
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FlowState",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <MobileShell>{children}</MobileShell>
      </body>
    </html>
  );
}