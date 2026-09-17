"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Shield,
  CreditCard,
  BarChart3,
  Lock,
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
      className="w-full lg:w-64 shrink-0 bg-[#f8f9fa] border-b lg:border-b-0 lg:border-r border-gray-200/80 flex flex-col justify-start p-4 sm:p-5"
    >
      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 py-2">
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
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#eef6fc] text-[#1a7fc4] shadow-2xs font-bold border border-[#1a7fc4]/20"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 border border-transparent"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? "text-[#1a7fc4]" : "text-gray-400"
                }`}
              />
              <span className="truncate">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
