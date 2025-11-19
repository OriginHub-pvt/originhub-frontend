"use client";

import Link from "next/link";
import { useState } from "react";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import {
  IconMessageCircle,
  IconBulb,
  IconHome,
  IconUser,
} from "@tabler/icons-react";

const navLinks = [
  {
    label: "Marketplace",
    href: "/marketplace",
    icon: <IconBulb className="h-5 w-5 shrink-0 text-white" />,
  },
  {
    label: "Chat",
    href: "/chat",
    icon: <IconMessageCircle className="h-5 w-5 shrink-0 text-white" />,
  },
];

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center space-x-2 text-neutral-900 dark:text-neutral-50"
    >
      <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-[#0e3a5f] to-[#14b8a6]" />
      <span className="text-sm font-semibold">OriginHub</span>
    </Link>
  );
}

function LogoIcon() {
  return (
    <Link href="/" className="flex items-center">
      <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-[#0e3a5f] to-[#14b8a6]" />
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { isSignedIn, user } = useUser();

  // Extract bio from metadata with proper type checking
  const userBio = user?.publicMetadata?.bio;
  const bio = typeof userBio === "string" ? userBio : null;

  return (
    <div className="relative h-screen overflow-hidden bg-neutral-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <ShootingStars />
        <StarsBackground />
      </div>
      <div className="relative z-10 flex h-screen">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10 rounded-e-3xl bg-slate-900/90 px-5 py-6 text-slate-100 shadow-2xl">
            <div className="flex flex-1 flex-col overflow-hidden">
              {open ? <Logo /> : <LogoIcon />}
              <div className="mt-8 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <SidebarLink key={link.label} link={link} />
                ))}
                <SidebarLink
                  link={{
                    label: "Home",
                    href: "/",
                    icon: <IconHome className="h-5 w-5 shrink-0 text-white" />,
                  }}
                />
                {isSignedIn && (
                  <SidebarLink
                    link={{
                      label: "Profile",
                      href: "/profile",
                      icon: (
                        <IconUser className="h-5 w-5 shrink-0 text-white" />
                      ),
                    }}
                  />
                )}
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              {isSignedIn ? (
                <>
                  <div className="flex items-center gap-3">
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "h-8 w-8",
                        },
                      }}
                    />
                    {open && (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">
                          {user?.firstName ||
                            user?.emailAddresses[0]?.emailAddress}
                        </span>
                        <span className="text-xs text-slate-400">
                          {user?.emailAddresses[0]?.emailAddress}
                        </span>
                        {bio && (
                          <span className="mt-1 text-xs text-slate-500 line-clamp-2">
                            {bio.substring(0, 50)}
                            {bio.length > 50 && "..."}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <SignInButton mode="modal">
                  <button className="w-full rounded-lg bg-gradient-to-r from-[#0e3a5f] to-[#14b8a6] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity">
                    Sign In
                  </button>
                </SignInButton>
              )}
            </div>
          </SidebarBody>
        </Sidebar>
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
