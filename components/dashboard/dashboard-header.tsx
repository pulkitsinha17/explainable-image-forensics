"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

interface DashboardHeaderProps {
  firstName: string;
}

export function DashboardHeader({ firstName }: DashboardHeaderProps) {
  const [greeting, setGreeting] = useState<string>("Good afternoon");
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "afternoon" | "evening">("afternoon");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
      setTimeOfDay("morning");
    } else if (hour < 18) {
      setGreeting("Good afternoon");
      setTimeOfDay("afternoon");
    } else {
      setGreeting("Good evening");
      setTimeOfDay("evening");
    }
  }, []);

  return (
    <div className="pt-1 sm:pt-2 flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
          {timeOfDay === "morning" && (
            <Sun className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500 stroke-[2.2] shrink-0" />
          )}
          {timeOfDay === "afternoon" && (
            <Sun className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500 stroke-[2.2] shrink-0" />
          )}
          {timeOfDay === "evening" && (
            <Moon className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-500 stroke-[2.2] shrink-0" />
          )}
          <span>
            {greeting}, {firstName}
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Investigate an image and uncover the evidence behind its pixels.
        </p>
      </div>
    </div>
  );
}

