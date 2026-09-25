"use client";

import { FileText, BarChart3, AlertTriangle, Percent, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export interface DashboardStats {
  totalAnalyses: number;
  analysesThisMonth: number;
  manipulatedDetected: number;
  averageRiskScore: number | null;
  totalAnalysesChange?: number | null;
  analysesThisMonthChange?: number | null;
  manipulatedDetectedChange?: number | null;
  averageRiskScoreChange?: number | null;
}

interface StatsGridProps {
  stats?: DashboardStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const shouldReduceMotion = useReducedMotion();
  const hasAnalyses = (stats?.totalAnalyses ?? 0) > 0;

  const cards = [
    {
      id: "total-analyses",
      label: "Total Analyses",
      value: stats ? stats.totalAnalyses.toString() : "0",
      change: stats?.totalAnalysesChange,
      subtext: hasAnalyses ? "Total scans performed" : "No analyses yet",
      icon: FileText,
      accentColor: "#1a7fc4",
      topBarClass: "bg-gradient-to-r from-[#1a7fc4] via-blue-400 to-transparent",
      iconBg: "bg-blue-50 text-[#1a7fc4] border border-blue-100/90 group-hover:bg-blue-500 group-hover:text-white",
      hoverRing: "group-hover:border-blue-200/90 group-hover:shadow-[0_8px_30px_rgba(26,127,196,0.08)]",
    },
    {
      id: "analyses-month",
      label: "Analyses This Month",
      value: stats ? stats.analysesThisMonth.toString() : "0",
      change: stats?.analysesThisMonthChange,
      subtext: hasAnalyses ? "Current billing cycle" : "No analyses yet",
      icon: BarChart3,
      accentColor: "#10b981",
      topBarClass: "bg-gradient-to-r from-emerald-500 via-teal-400 to-transparent",
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100/90 group-hover:bg-emerald-500 group-hover:text-white",
      hoverRing: "group-hover:border-emerald-200/90 group-hover:shadow-[0_8px_30px_rgba(16,185,129,0.08)]",
    },
    {
      id: "manipulated-detected",
      label: "Manipulated Detected",
      value: stats ? stats.manipulatedDetected.toString() : "0",
      change: stats?.manipulatedDetectedChange,
      subtext: hasAnalyses ? "Flagged as manipulated" : "No analyses yet",
      icon: AlertTriangle,
      accentColor: "#f43f5e",
      topBarClass: "bg-gradient-to-r from-rose-500 via-pink-400 to-transparent",
      iconBg: "bg-rose-50 text-rose-600 border border-rose-100/90 group-hover:bg-rose-500 group-hover:text-white",
      hoverRing: "group-hover:border-rose-200/90 group-hover:shadow-[0_8px_30px_rgba(244,63,94,0.08)]",
    },
    {
      id: "avg-score",
      label: "Avg. Forensic Score",
      value:
        stats && stats.averageRiskScore !== null
          ? `${stats.averageRiskScore}%`
          : "—",
      change: stats?.averageRiskScoreChange,
      subtext:
        stats && stats.averageRiskScore !== null
          ? "Across all investigations"
          : "No analyses yet",
      icon: Percent,
      accentColor: "#8b5cf6",
      topBarClass: "bg-gradient-to-r from-purple-500 via-indigo-400 to-transparent",
      iconBg: "bg-purple-50 text-purple-600 border border-purple-100/90 group-hover:bg-purple-500 group-hover:text-white",
      hoverRing: "group-hover:border-purple-200/90 group-hover:shadow-[0_8px_30px_rgba(139,92,246,0.08)]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.05 }}
            whileHover={shouldReduceMotion ? undefined : { y: -3 }}
            className={`group relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-default ${card.hoverRing}`}
          >
            {/* Top Micro Accent Line */}
            <div
              className={`absolute top-0 left-0 right-0 h-[3px] opacity-80 group-hover:opacity-100 transition-opacity ${card.topBarClass}`}
            />

            {/* Top Row: Metric Label + Icon Badge */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                {card.label}
              </span>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-2xs ${card.iconBg}`}
              >
                <Icon className="w-5 h-5 stroke-[2]" />
              </div>
            </div>

            {/* Middle Row: Large Stat Value + Percentage Pill */}
            <div className="my-3.5 flex items-baseline gap-2.5 flex-wrap">
              <span className="text-3xl sm:text-[32px] font-black text-slate-900 tracking-tight leading-none font-mono">
                {card.value}
              </span>

              {card.change !== null && card.change !== undefined && card.change > 0 && (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 shadow-2xs">
                  <ArrowUpRight className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                  <span>{card.change}%</span>
                </span>
              )}
            </div>

            {/* Bottom Row: Context Description */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium truncate">
                {card.subtext}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-slate-400 transition-colors" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
