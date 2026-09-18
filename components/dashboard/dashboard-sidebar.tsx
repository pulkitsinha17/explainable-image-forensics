"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";

interface DashboardSidebarProps {
  user: {
    displayName: string;
    email?: string;
    imageUrl?: string;
  };
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const [mobileOpen, setMobileOpen] = useState(false);

  const primaryNavItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      name: "Analyze",
      href: "/analyze",
      icon: Zap,
      active: pathname.startsWith("/analyze"),
    },
    {
      name: "History",
      href: "/history",
      icon: Clock,
      active: pathname.startsWith("/history"),
    },
  ];

  const secondaryNavItems = [
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      active: pathname.startsWith("/settings"),
    },
  ];

  const firstLetter = (user.displayName?.[0] || "U").toUpperCase();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white justify-between">
      <div>
        {/* Brand Header */}
        <div className="px-6 py-6 border-b border-gray-100">
          <Link href="/dashboard" className="inline-block group">
            <div className="flex items-center gap-2.5">
              <Image
                src="/pixentra-logo.svg"
                alt="PIXENTRA"
                width={180}
                height={90}
                className="h-11 w-auto transition-transform group-hover:scale-[1.02]"
                priority
              />
            </div>
            <p className="text-[11px] font-medium text-gray-400 tracking-wide mt-1.5 pl-0.5">
              See Beyond the Pixels
            </p>
          </Link>
        </div>

        {/* Primary Navigation */}
        <div className="px-4 py-5 space-y-1">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  item.active
                    ? "bg-[#eef6fc] text-[#1a7fc4] font-semibold shadow-xs"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    item.active ? "text-[#1a7fc4]" : "text-gray-500"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Separator */}
        <div className="px-6 my-2">
          <div className="border-t border-gray-100" />
        </div>

        {/* Secondary Navigation */}
        <div className="px-4 py-2 space-y-1">
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  item.active
                    ? "bg-[#eef6fc] text-[#1a7fc4] font-semibold shadow-xs"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    item.active ? "text-[#1a7fc4]" : "text-gray-500"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* User Information */}
      <div className="p-4 border-t border-gray-100">
        {/* User profile card */}
        <Link
          href="/settings/profile"
          onClick={() => setMobileOpen(false)}
          className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-gray-100/80 transition-colors text-left group"
          title="Manage account settings"
        >
          {user.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={user.displayName}
              width={32}
              height={32}
              unoptimized
              className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-600 text-white flex items-center justify-center font-semibold text-xs shrink-0">
              {firstLetter}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-900 truncate group-hover:text-[#1a7fc4] transition-colors">
              {user.displayName}
            </p>
            <p className="text-[11px] text-gray-500 truncate">Account Settings</p>
          </div>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (approx 240px wide) */}
      <aside className="hidden lg:flex w-[245px] shrink-0 border-r border-gray-100 flex-col sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Top Header / Toggle */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/pixentra-logo.svg"
            alt="PIXENTRA"
            width={160}
            height={80}
            className="h-10 w-auto"
          />
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex flex-col w-[260px] max-w-[80vw] h-full bg-white shadow-xl z-10">
            <div className="absolute top-4 right-4 z-20">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                aria-label="Close navigation menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
