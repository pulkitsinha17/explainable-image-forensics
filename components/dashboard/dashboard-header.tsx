"use client";

import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";

interface DashboardHeaderProps {
  firstName: string;
}

export function DashboardHeader({ firstName }: DashboardHeaderProps) {
  const [greeting, setGreeting] = useState<string>("Good afternoon");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  return (
    <div className="pt-2 sm:pt-3 flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          {greeting}, {firstName}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Investigate an image and uncover the evidence behind its pixels.
        </p>
      </div>

      <div className="flex items-center shrink-0">
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
  );
}

