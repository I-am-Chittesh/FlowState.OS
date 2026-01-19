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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FlowState",
  },
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL("https://flowstate.app"),
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FlowState" />
        <meta name="application-name" content="FlowState" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <MobileShell>{children}</MobileShell>
      </body>
    </html>
  );
}