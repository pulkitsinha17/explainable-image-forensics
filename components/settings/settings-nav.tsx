"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Shield,
  CreditCard,
  BarChart3,
  Lock,
  ChevronRight,
} from "lucide-react";


export const SETTINGS_TABS = [
  {
    name: "Profile",
    href: "/settings/profile",
    icon: User,
    description: "Personal details & account information",
  },
  {
    name: "Security",
    href: "/settings/security",
    icon: Shield,
    description: "Authentication & security status",
  },
  {
    name: "Subscription & Billing",
    href: "/settings/subscription",
    icon: CreditCard,
    description: "Plan entitlements & upgrade options",
  },
  {
    name: "Usage",
    href: "/settings/usage",
    icon: BarChart3,
    description: "Analysis quota & real consumption",
  },
  {
    name: "Data & Privacy",
    href: "/settings/privacy",
    icon: Lock,
    description: "Data retention & management actions",
  },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Settings navigation"
      className="w-full lg:w-68 shrink-0 bg-slate-50/80 dark:bg-slate-950/40 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-start p-2.5 sm:p-4"
    >
      <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible py-1 lg:py-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <p className="hidden lg:block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-2">
          Settings Menu
        </p>

        {SETTINGS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            pathname === tab.href ||
            (tab.href === "/settings/profile" && pathname === "/settings");

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`group relative flex items-center justify-between gap-2.5 sm:gap-3 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap lg:whitespace-normal ${
                isActive
                  ? "text-[#1a7fc4] dark:text-[#5bb8f5] font-bold bg-[#eef6fc] dark:bg-blue-950/50 border border-[#1a7fc4]/25 dark:border-blue-800/60 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? "bg-[#1a7fc4]/10 dark:bg-blue-900/40 text-[#1a7fc4] dark:text-[#5bb8f5]"
                      : "bg-white/80 dark:bg-slate-800 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:bg-white dark:group-hover:bg-slate-700"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform duration-200 group-hover:scale-105" />
                </div>
                <span className="truncate">{tab.name}</span>
              </div>

              <ChevronRight
                className={`hidden lg:block w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                  isActive
                    ? "text-[#1a7fc4] dark:text-[#5bb8f5] opacity-100 translate-x-0"
                    : "text-slate-400 dark:text-slate-600 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

