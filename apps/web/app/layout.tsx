import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "../components/app-sidebar";
import { AuthRefreshOnLoad } from "../components/auth-refresh-on-load";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Auth Starter',
  description: 'Signup and login experience for NestJS + Next.js monorepo',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="h-full">
        <AuthRefreshOnLoad />
        <AppSidebar />
        {/* Offset for fixed sidebar on desktop, fixed top bar on mobile */}
        <div className="min-h-screen pt-14 lg:pl-60 lg:pt-0">
          {children}
        </div>
      </body>
    </html>
  );
}
