import { Quote, ShieldCheck } from "lucide-react";

export function ForensicQuote() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#f0f7fd]/85 border border-[#d2e6f9] p-4 sm:p-4.5 shadow-2xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        {/* Quote Content */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-xl bg-white text-[#1a7fc4] border border-[#d2e6f9] flex items-center justify-center shrink-0 shadow-2xs">
            <Quote className="w-4 h-4 fill-[#1a7fc4]/15 text-[#1a7fc4]" />
          </div>

          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
              &ldquo;In a world of altered realities, evidence matters.&rdquo;
            </p>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              PIXENTRA verifies digital authenticity through multi-evidence neural forensics.
            </p>
          </div>
        </div>

        {/* Brand Badge */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0 px-3 py-1 rounded-full bg-white border border-[#d2e6f9] text-[#1a7fc4] text-[10px] font-bold font-mono tracking-wide uppercase shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-[#1a7fc4]" />
          <span>PIXENTRA FORENSICS</span>
        </div>
      </div>
    </div>
  );
}
