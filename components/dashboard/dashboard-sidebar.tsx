"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  Clock,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
} from "lucide-react";
import { useReducedMotion } from "motion/react";

interface DashboardSidebarProps {
  user?: {
    displayName?: string;
    email?: string;
    imageUrl?: string;
  };
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  // Sidebar collapse state with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem("pixentra_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // safe fallback
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("pixentra_sidebar_collapsed", String(next));
      } catch {
        // safe fallback
      }
      return next;
    });
  };

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

  return (
    <>
      {/* ───────────────────────────────────────────────────────────── */}
      {/* Desktop Sidebar (Collapsible: 260px Expanded / 72px Collapsed) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <aside
        className={`hidden lg:flex shrink-0 border-r border-slate-200/80 bg-white flex-col sticky top-0 h-screen z-30 select-none ${
          prefersReducedMotion ? "" : "transition-[width] duration-300 ease-in-out"
        } ${isCollapsed ? "w-[72px]" : "w-[260px]"}`}
      >
        <div className="flex flex-col h-full bg-white">
          {/* Header & Brand Section */}
          <div
            className={`border-b border-slate-100 flex items-center transition-all duration-300 ${
              isCollapsed ? "px-3 py-4 flex-col gap-3 justify-center" : "px-5 py-5 justify-between"
            }`}
          >
            {/* Logo Link */}
            <Link
              href="/dashboard"
              className="group flex items-center outline-none focus-visible:ring-2 focus-visible:ring-[#1a7fc4] rounded-lg"
              title="PIXENTRA Dashboard"
            >
              {isCollapsed ? (
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50/50 transition-colors shadow-2xs">
                  <Image
                    src="/pixentra-icon.svg"
                    alt="PIXENTRA"
                    width={26}
                    height={26}
                    className="w-6.5 h-6.5 object-contain"
                    priority
                  />
                </div>
              ) : (
                <div className="flex flex-col">
                  <Image
                    src="/pixentra-logo.svg"
                    alt="PIXENTRA"
                    width={150}
                    height={75}
                    className="h-10 w-auto transition-transform group-hover:scale-[1.02]"
                    priority
                  />
                  <span className="text-[10px] font-semibold text-slate-400 tracking-wider mt-1 pl-0.5">
                    See Beyond the Pixels
                  </span>
                </div>
              )}
            </Link>

            {/* Dedicated Collapse / Expand Toggle Button */}
            <button
              type="button"
              onClick={toggleSidebar}
              className={`rounded-lg p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#1a7fc4] ${
                isCollapsed ? "mt-1" : ""
              }`}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4.5 h-4.5" />
              ) : (
                <PanelLeftClose className="w-4.5 h-4.5" />
              )}
            </button>
          </div>

          {/* Primary Navigation Items */}
          <div className="py-4 space-y-1.5 px-3">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative group flex items-center rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#1a7fc4] ${
                    isCollapsed
                      ? "w-11 h-11 mx-auto justify-center"
                      : "px-3.5 py-2.5 gap-3 text-sm font-medium"
                  } ${
                    item.active
                      ? "bg-[#eef6fc] text-[#1a7fc4] font-semibold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon
                    className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                      item.active ? "text-[#1a7fc4]" : "text-slate-500 group-hover:text-slate-800"
                    }`}
                  />

                  {/* Text Label in Expanded State */}
                  {!isCollapsed && (
                    <span className="truncate whitespace-nowrap">{item.name}</span>
                  )}

                  {/* Elegant Floating Tooltip in Collapsed State */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-all duration-150 z-50 translate-x-[-4px] group-hover:translate-x-0">
                      <span>{item.name}</span>
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Separator */}
          <div className="px-4 my-1">
            <div className="border-t border-slate-100" />
          </div>

          {/* Secondary Navigation Items (Settings) */}
          <div className="py-2 space-y-1.5 px-3">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative group flex items-center rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#1a7fc4] ${
                    isCollapsed
                      ? "w-11 h-11 mx-auto justify-center"
                      : "px-3.5 py-2.5 gap-3 text-sm font-medium"
                  } ${
                    item.active
                      ? "bg-[#eef6fc] text-[#1a7fc4] font-semibold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon
                    className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                      item.active ? "text-[#1a7fc4]" : "text-slate-500 group-hover:text-slate-800"
                    }`}
                  />

                  {/* Text Label in Expanded State */}
                  {!isCollapsed && (
                    <span className="truncate whitespace-nowrap">{item.name}</span>
                  )}

                  {/* Elegant Floating Tooltip in Collapsed State */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-all duration-150 z-50 translate-x-[-4px] group-hover:translate-x-0">
                      <span>{item.name}</span>
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </aside>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Mobile Top Header (Responsive for < 1024px)                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-2xs">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/pixentra-logo.svg"
            alt="PIXENTRA"
            width={140}
            height={70}
            className="h-9 w-auto"
            priority
          />
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Mobile Navigation Drawer Overlay                              */}
      {/* ───────────────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex flex-col w-[260px] max-w-[80vw] h-full bg-white shadow-2xl z-10">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <Image
                src="/pixentra-logo.svg"
                alt="PIXENTRA"
                width={130}
                height={65}
                className="h-8.5 w-auto"
              />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                aria-label="Close navigation menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-1 flex-1">
              {[...primaryNavItems, ...secondaryNavItems].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      item.active
                        ? "bg-[#eef6fc] text-[#1a7fc4] font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Icon
                      className={`w-4.5 h-4.5 ${
                        item.active ? "text-[#1a7fc4]" : "text-slate-500"
                      }`}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
