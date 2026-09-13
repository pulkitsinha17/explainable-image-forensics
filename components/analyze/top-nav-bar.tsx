"use client";

import { Search, Bell } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

interface TopNavBarProps {
  userInitial?: string;
  userDisplayName?: string;
}

export function TopNavBar({
  userInitial = "P",
  userDisplayName = "Pulkit Sinha",
}: TopNavBarProps) {
  return (
    <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-100">
      {/* Search Input with Shortcut */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search analyses, reports..."
            className="w-full pl-9 pr-14 py-2 text-xs sm:text-sm bg-gray-50/80 hover:bg-gray-100/60 focus:bg-white border border-gray-200/80 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a7fc4]/20 focus:border-[#1a7fc4] transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-white border border-gray-200 rounded shadow-2xs">
              Ctrl
            </kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-white border border-gray-200 rounded shadow-2xs">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* Actions: Notification Bell + Clerk User Avatar */}
      <div className="flex items-center gap-3 ml-auto">
        <button
          type="button"
          className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#1a7fc4] rounded-full ring-2 ring-white" />
        </button>

        <div className="flex items-center">
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "w-8 h-8 ring-2 ring-gray-100 hover:ring-[#1a7fc4]/40 transition-all",
              },
            }}
            fallback={
              <div
                className="w-8 h-8 rounded-full bg-slate-600 text-white flex items-center justify-center font-semibold text-xs ring-2 ring-gray-100"
                title={userDisplayName}
              >
                {userInitial}
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
