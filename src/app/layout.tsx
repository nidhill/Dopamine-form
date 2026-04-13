import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HACA Design School — Dopamine Registration",
  description: "Join the HACA Design School community. Register now and get your exclusive Dopamine ID card.",
};

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
