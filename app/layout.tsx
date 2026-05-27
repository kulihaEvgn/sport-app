import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ProvidersShell } from "@/components/providers-shell";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sport App",
  description: "Telegram Mini App для тренировок",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ProvidersShell>{children}</ProvidersShell>
      </body>
    </html>
  );
}
