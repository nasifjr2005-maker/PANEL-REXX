import type { Metadata, Viewport } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap"
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Nasif | Panel Rexx - Futuristic Portfolio",
  description:
    "The immersive digital universe of Nasif, also known as Panel Rexx: Computer Science & Technology diploma student, founder, developer, gamer, and modern web builder.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "Nasif | Panel Rexx",
    description:
      "A cinematic cyberpunk portfolio experience for Nasif, founder of PANEL 50 OFFICIAL STORE and PANEL 50 GUILD.",
    type: "website"
  }
};

export const viewport: Viewport = {
  themeColor: "#050715",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${rajdhani.variable}`}>
      <body>{children}</body>
    </html>
  );
}
