"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const dashboardNavTabs = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Use Cases", href: "/#use-cases" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

export function DashboardNavbar() {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-7 h-18 flex items-center justify-between gap-4">
        {/* Left balance placeholder to center the nav tabs */}
        <div className="w-10 h-10 hidden sm:block shrink-0 invisible pointer-events-none" />

        {/* Centered Navigation Tabs */}
        <nav
          className="flex-1 flex items-center justify-center gap-1 overflow-x-auto py-1 -mx-1 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Dashboard top navigation"
        >
          {dashboardNavTabs.map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-[#1a7fc4] hover:bg-blue-50 transition-all duration-200 shrink-0 whitespace-nowrap"
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {/* User Profile Avatar */}
        <div className="flex items-center justify-end shrink-0 w-10">
          <UserButton
            userProfileMode="navigation"
            userProfileUrl="/settings/profile"
            appearance={{
              elements: {
                avatarBox:
                  "w-10 h-10 ring-2 ring-gray-200/80 hover:ring-[#1a7fc4]/50 transition-all",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
