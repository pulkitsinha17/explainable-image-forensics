"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

interface TopNavBarProps {
  userInitial?: string;
  userDisplayName?: string;
  backHref?: string;
  backLabel?: string;
}

export function TopNavBar({
  userInitial = "P",
  userDisplayName = "Pulkit Sinha",
  backHref = "/dashboard",
  backLabel = "Back to Dashboard",
}: TopNavBarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Back Link */}
      {backHref ? (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#1a7fc4] transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>{backLabel}</span>
        </Link>
      ) : (
        <div />
      )}

      {/* Clerk User Avatar - Enlarged to 40px (w-10 h-10) */}
      <div className="flex items-center">
        <UserButton
          appearance={{
            elements: {
              avatarBox:
                "w-10 h-10 ring-2 ring-gray-200/80 hover:ring-[#1a7fc4]/50 transition-all",
            },
          }}
          fallback={
            <div
              className="w-10 h-10 rounded-full bg-slate-600 text-white flex items-center justify-center font-bold text-sm ring-2 ring-gray-200/80"
              title={userDisplayName}
            >
              {userInitial}
            </div>
          }
        />
      </div>
    </div>
  );
}
