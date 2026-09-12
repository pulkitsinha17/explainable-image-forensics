import { Quote } from "lucide-react";

export function ForensicQuote() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-blue-50/80 border border-blue-100/80 flex items-center justify-center text-[#1a7fc4] shrink-0">
          <Quote className="w-5 h-5 fill-[#1a7fc4]/20 text-[#1a7fc4]" />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug">
            In a world of altered realities, evidence matters.
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            PIXENTRA helps you see beyond the pixels.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 pt-2 sm:pt-0">
        <div className="w-10 sm:w-14 h-px bg-gray-200" />
        <span className="text-[11px] font-medium text-gray-400 tracking-wide">
          See Beyond the Pixels
        </span>
      </div>
    </div>
  );
}
