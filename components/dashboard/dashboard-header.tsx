"use client";

interface DashboardHeaderProps {
  firstName: string;
}

export function DashboardHeader({ firstName }: DashboardHeaderProps) {
  return (
    <div className="pt-1 sm:pt-2 flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Investigate images and uncover the evidence behind their pixels.
        </p>
      </div>
    </div>
  );
}
