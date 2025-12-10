import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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
  title: "OriginHub - Turn Problems into Startup Ideas",
  description:
    "AI-powered platform that transforms real-world problems into actionable startup ideas",
  keywords: ["startup", "AI", "ideas", "entrepreneurship", "innovation"],
};

// Force dynamic rendering to prevent build-time Clerk key requirement
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get publishable key from env (empty string is allowed during build)
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      // Only set domain if explicitly configured (prevents certificate errors)
      {...(process.env.NEXT_PUBLIC_CLERK_DOMAIN && {
        domain: process.env.NEXT_PUBLIC_CLERK_DOMAIN,
      })}
    >
      <html lang="en" className="scroll-smooth">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-slate-900`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
