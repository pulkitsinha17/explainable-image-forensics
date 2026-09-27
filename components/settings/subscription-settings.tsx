"use client";

import Link from "next/link";
import { Zap, Check, ArrowRight, Star, Clock, ShieldCheck, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/components/motion-utils";
import type { UserUsageInfo } from "@/lib/plans";
import { PLAN_DEFINITIONS } from "@/lib/plans";

interface SubscriptionSettingsProps {
  usage: UserUsageInfo;
}

export function SubscriptionSettings({ usage }: SubscriptionSettingsProps) {
  const shouldReduceMotion = useReducedMotion();
  const currentPlan = PLAN_DEFINITIONS[usage.plan] || PLAN_DEFINITIONS.free;
  const progressPct = Math.min(100, Math.round((usage.used / usage.limit) * 100));

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: shouldReduceMotion ? 0 : 0.02,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0.1 : 0.4, ease: EASE_OUT },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* 1. Current Active Plan Card */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-2xs space-y-6 relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
      >
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#1a7fc4]" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40 group-hover:scale-105 transition-transform duration-200">
              <Zap className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {currentPlan.name} Plan
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentPlan.price} {currentPlan.period} • {currentPlan.limit} analyses {currentPlan.periodLabel.toLowerCase()}
              </p>
            </div>
          </div>

          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a7fc4] hover:bg-[#1565a8] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs self-start sm:self-auto hover:shadow cursor-pointer active:scale-[0.98]"
          >
            <span>Compare Plans</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Live Quota Consumption Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
            <span className="text-slate-700 dark:text-slate-300">Image Analyses Allowance</span>
            <span className="text-slate-900 dark:text-white font-bold">
              {usage.used} / {usage.limit} used ({usage.remaining} remaining)
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: shouldReduceMotion ? 0.1 : 0.8, ease: EASE_OUT }}
              className={`h-full rounded-full ${
                progressPct >= 100
                  ? "bg-rose-500"
                  : progressPct >= 80
                  ? "bg-amber-500"
                  : "bg-[#1a7fc4]"
              }`}
            />
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {usage.plan === "free"
              ? "Your Free tier includes 5 lifetime analyses with full forensic capabilities."
              : `Quota resets automatically at the start of each billing period.`}
          </p>
        </div>
      </motion.div>

      {/* 2. Vertically Stacked Upgrade Options */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Upgrade Your Plan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            All plans have access to the same PIXENTRA forensic analysis tools, heatmaps, and explainable AI. Plans differ strictly by analysis capacity.
          </p>
        </div>

        {/* Monthly Plan Row Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-[#1a7fc4]/30 dark:border-[#1a7fc4]/40 hover:border-[#1a7fc4] p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all duration-200 space-y-4 group">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1a7fc4] dark:text-[#5bb8f5]">
                  Monthly Plan
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] border border-blue-200/60 dark:border-blue-800/50">
                  <Star className="w-2.5 h-2.5 fill-current" /> Recommended
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">₹199</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">/ month</span>
              </div>
            </div>

            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1a7fc4] hover:bg-[#1565a8] text-white text-xs font-semibold transition-all shadow-2xs self-start sm:self-auto hover:shadow active:scale-[0.98] cursor-pointer group/btn"
            >
              <span>View & Upgrade</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#1a7fc4] dark:text-[#5bb8f5] stroke-[2.5]" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">25 analyses per month</span>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Razorpay integration coming soon
            </span>
          </div>
        </div>

        {/* Yearly Plan Row Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all duration-200 space-y-4 group">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Yearly Plan
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50">
                  Best Value
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">₹1,999</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">/ year</span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 ml-2">
                  (Save ₹389/yr)
                </span>
              </div>
            </div>

            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold transition-all shadow-2xs self-start sm:self-auto hover:shadow active:scale-[0.98] cursor-pointer group/btn"
            >
              <span>View & Upgrade</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#1a7fc4] dark:text-[#5bb8f5] stroke-[2.5]" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">300 analyses per year</span>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Razorpay integration coming soon
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
