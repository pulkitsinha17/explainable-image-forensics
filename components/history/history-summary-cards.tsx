"use client";

import { FileText, CheckCircle2, AlertTriangle, AlertCircle, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/components/motion-utils";
import type { HistorySummaryStats } from "./types";

interface HistorySummaryCardsProps {
  stats: HistorySummaryStats;
  selectedVerdictFilter?: string;
  onSelectVerdictFilter?: (verdict: string) => void;
}

export function HistorySummaryCards({
  stats,
  selectedVerdictFilter = "All Verdicts",
  onSelectVerdictFilter,
}: HistorySummaryCardsProps) {
  const shouldReduceMotion = useReducedMotion();

  const total = stats.completedCount > 0 ? stats.completedCount : stats.totalAnalyses;
  const authenticated = stats.authenticatedCount ?? 0;
  const manipulated = stats.manipulatedCount ?? stats.potentiallyForgedCount ?? 0;
  const inconclusive =
    stats.inconclusiveCount ??
    (total >= authenticated + manipulated ? total - authenticated - manipulated : 0);

  const authPercentage = total > 0 ? Math.round((authenticated / total) * 100) : 0;
  const manipPercentage = total > 0 ? Math.round((manipulated / total) * 100) : 0;
  const inconclusivePercentage = total > 0 ? Math.round((inconclusive / total) * 100) : 0;

  const cards = [
    {
      id: "all",
      filterValue: "All Verdicts",
      title: "Total Analyses",
      value: total.toLocaleString(),
      subtext: "All completed records",
      icon: FileText,
      iconBg: "bg-slate-50 text-slate-700",
      iconBorder: "border-slate-200/80",
      activeBorder: "border-[#1a7fc4] ring-2 ring-[#1a7fc4]/15 bg-blue-50/20",
      accentBar: "bg-blue-500",
      pillBg: "bg-slate-100 text-slate-700",
      pctText: "100%",
    },
    {
      id: "authentic",
      filterValue: "Authentic",
      title: "Authentic",
      value: authenticated.toLocaleString(),
      subtext: `${authPercentage}% of all analyses`,
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 text-emerald-600",
      iconBorder: "border-emerald-200/70",
      activeBorder: "border-emerald-500 ring-2 ring-emerald-500/15 bg-emerald-50/20",
      accentBar: "bg-emerald-500",
      pillBg: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
      pctText: `${authPercentage}%`,
    },
    {
      id: "manipulated",
      filterValue: "Manipulated",
      title: "Manipulated",
      value: manipulated.toLocaleString(),
      subtext: `${manipPercentage}% of all analyses`,
      icon: AlertTriangle,
      iconBg: "bg-rose-50 text-rose-600",
      iconBorder: "border-rose-200/70",
      activeBorder: "border-rose-500 ring-2 ring-rose-500/15 bg-rose-50/20",
      accentBar: "bg-rose-500",
      pillBg: "bg-rose-50 text-rose-700 border-rose-200/60",
      pctText: `${manipPercentage}%`,
    },
    {
      id: "inconclusive",
      filterValue: "Inconclusive",
      title: "Inconclusive",
      value: inconclusive.toLocaleString(),
      subtext: `${inconclusivePercentage}% of all analyses`,
      icon: AlertCircle,
      iconBg: "bg-sky-50 text-sky-600",
      iconBorder: "border-sky-200/70",
      activeBorder: "border-sky-500 ring-2 ring-sky-500/15 bg-sky-50/20",
      accentBar: "bg-sky-500",
      pillBg: "bg-sky-50 text-sky-700 border-sky-200/60",
      pctText: `${inconclusivePercentage}%`,
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.05,
        delayChildren: shouldReduceMotion ? 0 : 0.02,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.4,
        ease: EASE_OUT,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = selectedVerdictFilter === card.filterValue;

        return (
          <motion.div
            key={card.id}
            variants={cardVariants}
            onClick={() => {
              if (onSelectVerdictFilter) {
                if (isSelected && card.filterValue !== "All Verdicts") {
                  onSelectVerdictFilter("All Verdicts");
                } else {
                  onSelectVerdictFilter(card.filterValue);
                }
              }
            }}
            className={`group bg-white rounded-2xl border p-4 shadow-2xs hover:shadow-sm transition-all duration-200 ease-out relative overflow-hidden flex flex-col justify-between cursor-pointer ${
              isSelected
                ? card.activeBorder
                : "border-slate-200/80 hover:border-slate-300 hover:-translate-y-0.5"
            }`}
          >
            {/* Top Accent Edge */}
            <div
              className={`absolute top-0 left-0 right-0 h-[2.5px] transition-opacity duration-200 ${
                isSelected ? card.accentBar : "opacity-0 group-hover:opacity-100 " + card.accentBar
              }`}
            />

            {/* Header Row: Label & Micro Badge */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                  isSelected ? "bg-white shadow-2xs " + card.pillBg : card.pillBg
                }`}
              >
                {card.pctText}
              </span>
            </div>

            {/* Bottom Row: Large Metric Value & Icon */}
            <div className="flex items-end justify-between gap-3 mt-3">
              <div>
                <p className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-none">
                  {card.value}
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  {card.subtext}
                </p>
              </div>

              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200 ${card.iconBg} ${card.iconBorder} group-hover:scale-105`}
              >
                <Icon className="w-5 h-5 stroke-[2]" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
