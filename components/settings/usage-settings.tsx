import Link from "next/link";
import { BarChart3, ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";
import type { UserUsageInfo } from "@/lib/subscription";

interface UsageSettingsProps {
  usage: UserUsageInfo;
}

export function UsageSettings({ usage }: UsageSettingsProps) {
  const isNearLimit = usage.percentage >= 80 && !usage.isLimitReached;
  const isAtLimit = usage.isLimitReached;

  return (
    <div className="space-y-6">
      {/* 1. Main Usage Quota Card (Single Vertical Card) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1a7fc4] flex items-center justify-center shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  Analysis Usage
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#1a7fc4]">
                  {usage.planName} Plan
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time forensic investigation capacity computed directly from your analyses.
              </p>
            </div>
          </div>

          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a7fc4] hover:bg-[#1565a8] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs self-start sm:self-auto"
          >
            <span>Upgrade Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Vertically Stacked Metric Rows */}
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">Current Plan</span>
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">{usage.planName}</span>
          </div>

          <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">Analyses Used</span>
            <span className="text-sm font-bold text-gray-900">{usage.used} / {usage.limit} analyses used</span>
          </div>

          <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">Analyses Remaining</span>
            <span className={`text-sm font-bold ${usage.remaining === 0 ? "text-rose-600" : "text-emerald-600"}`}>
              {usage.remaining} analyses remaining
            </span>
          </div>
        </div>

        {/* Progress Bar & Status Warning */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-gray-700">Usage Progress</span>
            <span className="text-gray-900">{usage.percentage}%</span>
          </div>

          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isAtLimit
                  ? "bg-rose-500"
                  : isNearLimit
                  ? "bg-amber-500"
                  : "bg-[#1a7fc4]"
              }`}
              style={{ width: `${usage.percentage}%` }}
            />
          </div>

          <p className="text-xs text-gray-500">
            {usage.plan === "free"
              ? "Your Free plan includes 5 analyses total."
              : `Your ${usage.planName} plan includes ${usage.limit} analyses ${usage.periodLabel.toLowerCase()}.`}
          </p>

          {isAtLimit && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center gap-3 text-xs text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                You have reached your {usage.planName} plan analysis limit ({usage.limit} analyses). Upgrade to continue investigating images.
              </span>
            </div>
          )}

          {isNearLimit && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center gap-3 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                You have used {usage.percentage}% of your allowed quota. {usage.remaining} analyses remaining.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Quota Rules & Tier Reference (Single Vertical Card) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#1a7fc4]" />
          Plan Allowance Specifications
        </h3>

        <div className="space-y-2 text-xs text-gray-600">
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="font-bold text-gray-900 block mb-0.5">Free Plan (₹0)</span>
            <span>Includes 5 total lifetime forensic image analyses.</span>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="font-bold text-gray-900 block mb-0.5">Monthly Plan (₹199 / month)</span>
            <span>Includes 25 forensic image analyses per calendar monthly billing cycle.</span>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="font-bold text-gray-900 block mb-0.5">Yearly Plan (₹1,999 / year)</span>
            <span>Includes 300 forensic image analyses per annual billing cycle.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
