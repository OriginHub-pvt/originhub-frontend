"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isSignedIn } = useUser();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/chat", label: "Chat" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/explore", label: "Explore" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#0e3a5f] to-[#14b8a6]">
              <span className="text-xl font-bold text-white">OH</span>
            </div>
            <span className="text-xl font-bold text-white">OriginHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-[#14b8a6]"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {isSignedIn ? (
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                  },
                }}
              />
            ) : (
              <SignInButton mode="modal">
                <button className="rounded-lg bg-gradient-to-r from-[#0e3a5f] to-[#14b8a6] px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#14b8a6]/25">
                  Get Started
                </button>
              </SignInButton>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-slate-300 hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700 py-4 animate-fade-in">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium ${
                    isActive
                      ? "text-[#14b8a6]"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {isSignedIn ? (
              <div className="mt-4 flex justify-center">
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8",
                    },
                  }}
                />
              </div>
            ) : (
              <SignInButton mode="modal">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mt-4 w-full rounded-lg bg-gradient-to-r from-[#0e3a5f] to-[#14b8a6] px-4 py-2 text-center text-sm font-semibold text-white"
                >
                  Get Started
                </button>
              </SignInButton>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
