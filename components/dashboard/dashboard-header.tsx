"use client";

import Link from "next/link";
import { Search, Bell, Plus } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

interface DashboardHeaderProps {
  firstName: string;
  greeting?: string;
}

export function DashboardHeader({
  firstName,
  greeting = "Good afternoon",
}: DashboardHeaderProps) {

  return (
    <div className="space-y-6">
      {/* Top Utility Bar */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-gray-100/80">
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search analyses..."
              className="w-full pl-9 pr-14 py-2 text-xs bg-gray-50/80 hover:bg-gray-100/60 focus:bg-white border border-gray-200/70 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a7fc4]/20 focus:border-[#1a7fc4] transition-all"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-white border border-gray-200 rounded shadow-2xs">
                Ctrl
              </kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-white border border-gray-200 rounded shadow-2xs">
                K
              </kbd>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Notification Bell */}
          <button
            type="button"
            className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#1a7fc4] rounded-full ring-2 ring-white" />
          </button>

          {/* User Button */}
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "w-8 h-8 ring-2 ring-gray-100 hover:ring-[#1a7fc4]/40 transition-all",
              },
            }}
          />
        </div>
      </div>

      {/* Main Welcome & Status Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {greeting}, {firstName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Investigate an image and uncover the evidence behind its pixels.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
          {/* Operational Status Pill */}
          <div className="hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-gray-50/80 border border-gray-100 text-left">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <div>
              <p className="text-xs font-semibold text-gray-800 leading-tight">
                PIXENTRA systems operational
              </p>
              <p className="text-[11px] text-gray-400 leading-tight">
                All services are running normally.
              </p>
            </div>
          </div>

          {/* Primary Action Button */}
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a7fc4] hover:bg-[#1565a8] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span>Analyze Image</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
