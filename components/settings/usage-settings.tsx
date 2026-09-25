"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { BarChart3, ArrowRight, ShieldCheck, AlertTriangle, Zap, CheckCircle2 } from "lucide-react";
import type { UserUsageInfo } from "@/lib/plans";
import {
  EASE_OUT,
  SPRING_PRESS,
  containerVariantsFast,
  fadeUpItem,
} from "@/components/motion-utils";

interface UsageSettingsProps {
  usage: UserUsageInfo;
}

export function UsageSettings({ usage }: UsageSettingsProps) {
  const shouldReduceMotion = useReducedMotion();
  const isNearLimit = usage.percentage >= 80 && !usage.isLimitReached;
  const isAtLimit = usage.isLimitReached;

  return (
    <motion.div
      variants={containerVariantsFast}
      initial={shouldReduceMotion ? "visible" : "hidden"}
      animate="visible"
      className="space-y-6"
    >
      {/* 1. Main Usage Quota Card */}
      <motion.div
        variants={fadeUpItem}
        className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-xs space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1a7fc4] flex items-center justify-center shrink-0 shadow-2xs">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  Analysis Usage
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#1a7fc4] border border-blue-100/80 shadow-2xs">
                  {usage.planName} Plan
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time forensic investigation capacity computed directly from your analyses.
              </p>
            </div>
          </div>

          <Link href="/pricing">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={SPRING_PRESS}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a7fc4] hover:bg-[#1565a8] text-white text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer self-start sm:self-auto"
            >
              <span>Upgrade Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.div>
          </Link>
        </div>

        {/* Vertically Stacked Metric Rows */}
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100/90 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <span className="text-xs font-semibold text-gray-700">Current Plan</span>
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">{usage.planName}</span>
          </div>

          <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100/90 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <span className="text-xs font-semibold text-gray-700">Analyses Used</span>
            <span className="text-sm font-bold text-gray-900">{usage.used} / {usage.limit} analyses used</span>
          </div>

          <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100/90 flex items-center justify-between hover:bg-slate-50 transition-colors">
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
            <span className="text-gray-900 font-bold">{usage.percentage}%</span>
          </div>

          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden p-0.5">
            <motion.div
              initial={shouldReduceMotion ? false : { width: 0 }}
              animate={{ width: `${usage.percentage}%` }}
              transition={{ duration: 0.85, ease: EASE_OUT }}
              className={`h-full rounded-full ${
                isAtLimit
                  ? "bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                  : isNearLimit
                  ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                  : "bg-gradient-to-r from-[#1a7fc4] to-[#2597e6] shadow-[0_0_12px_rgba(26,127,196,0.35)]"
              }`}
            />
          </div>

          <p className="text-xs text-gray-500">
            {usage.plan === "free"
              ? "Your Free plan includes 5 analyses total."
              : `Your ${usage.planName} plan includes ${usage.limit} analyses ${usage.periodLabel.toLowerCase()}.`}
          </p>

          {isAtLimit && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center gap-3 text-xs text-rose-800"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                You have reached your {usage.planName} plan analysis limit ({usage.limit} analyses). Upgrade to continue investigating images.
              </span>
            </motion.div>
          )}

          {isNearLimit && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center gap-3 text-xs text-amber-800"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                You have used {usage.percentage}% of your allowed quota. {usage.remaining} analyses remaining.
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* 2. Quota Rules & Tier Reference */}
      <motion.div
        variants={fadeUpItem}
        className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-xs space-y-4"
      >
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#1a7fc4]" />
          Plan Allowance Specifications
        </h3>

        <div className="space-y-2.5 text-xs text-gray-600">
          <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100/90 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-gray-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
                Free Plan
              </span>
              <span className="font-semibold text-gray-700">₹0 / forever</span>
            </div>
            <p className="text-gray-500">Includes 5 total lifetime forensic image analyses.</p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100/90 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-gray-900 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#1a7fc4]" />
                Monthly Plan
              </span>
              <span className="font-semibold text-[#1a7fc4]">₹199 / month</span>
            </div>
            <p className="text-gray-500">Includes 25 forensic image analyses per calendar monthly billing cycle.</p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100/90 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-gray-900 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-purple-600" />
                Yearly Plan
              </span>
              <span className="font-semibold text-purple-700">₹1,999 / year</span>
            </div>
            <p className="text-gray-500">Includes 300 forensic image analyses per annual billing cycle.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
