import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lunaris — ISRO Lunar Image Registration",
  description:
    "Dashboard for ISRO's Chandrayaan Lunar Image Co-Registration and Tie-Point Extraction System (Problem Statement 26166).",
  keywords: ["ISRO", "Chandrayaan", "lunar", "image registration", "remote sensing"],
  authors: [{ name: "ISRO Lunaris Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
