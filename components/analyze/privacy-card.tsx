import { ShieldCheck } from "lucide-react";

export function PrivacyCard() {
  return (
    <div className="flex items-start sm:items-center gap-3.5 p-4 sm:p-5 bg-[#f0f7fd]/80 border border-[#d3e7f9] rounded-2xl text-left">
      <div className="w-8 h-8 rounded-xl bg-white text-[#1a7fc4] flex items-center justify-center shrink-0 shadow-2xs border border-[#d3e7f9]">
        <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
      </div>
      <div>
        <h4 className="text-xs sm:text-sm font-bold text-gray-900">
          Your privacy matters
        </h4>
        <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
          Uploaded images are securely processed for your analysis and are only accessible in your private account.
        </p>
      </div>
    </div>
  );
}
