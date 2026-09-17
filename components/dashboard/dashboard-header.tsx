"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          {greeting}, {firstName}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Investigate an image and uncover the evidence behind its pixels.
        </p>
      </div>

      <div className="flex items-center gap-3.5 self-start sm:self-auto shrink-0">
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

        {/* Profile Avatar (w-10 h-10) */}
        <div className="flex items-center pl-1">
          <UserButton
            userProfileMode="navigation"
            userProfileUrl="/settings"
            appearance={{
              elements: {
                avatarBox:
                  "w-10 h-10 ring-2 ring-gray-200/80 hover:ring-[#1a7fc4]/50 transition-all",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
