import { Quote, ShieldCheck } from "lucide-react";

export function ForensicQuote() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#f0f7fd]/85 dark:bg-[#121212] border border-[#d2e6f9] dark:border-slate-800 p-4 sm:p-4.5 shadow-2xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        {/* Quote Content */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-xl bg-white dark:bg-[#181818] text-[#1a7fc4] dark:text-[#5bb8f5] border border-[#d2e6f9] dark:border-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
            <Quote className="w-4 h-4 fill-[#1a7fc4]/15 text-[#1a7fc4] dark:text-[#5bb8f5]" />
          </div>

          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
              &ldquo;In a world of altered realities, evidence matters.&rdquo;
            </p>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              PIXENTRA verifies digital authenticity through multi-evidence neural forensics.
            </p>
          </div>
        </div>

        {/* Brand Badge */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0 px-3 py-1 rounded-full bg-white dark:bg-[#181818] border border-[#d2e6f9] dark:border-slate-700 text-[#1a7fc4] dark:text-[#5bb8f5] text-[10px] font-bold font-mono tracking-wide uppercase shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-[#1a7fc4] dark:text-[#5bb8f5]" />
          <span>PIXENTRA FORENSICS</span>
        </div>
      </div>
    </div>
  );
}
