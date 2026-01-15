import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MobileShell from "../components/layout/MobileShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlowState.os",
  description: "Deep Work OS",
};

// This separates the viewport config to fix the console warning
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MobileShell>{children}</MobileShell>
      </body>
    </html>
  );
}