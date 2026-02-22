import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MobileShell from "../components/layout/MobileShell";

const inter = Inter({ subsets: ["latin"] });

// 1. Responsive Viewport Settings (Mobile + Desktop)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
  maximumScale: 5, // Allow zooming on desktop
  userScalable: true, // Allow user scaling
};

// 2. The App Metadata (SEO + Apple Settings)
export const metadata: Metadata = {
  title: "FlowState.os",
  description: "The Operating System for Deep Work",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FlowState",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon-192.svg",
    apple: "/icon-192.svg",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "FlowState",
    "application-name": "FlowState",
    "theme-color": "#000000",
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