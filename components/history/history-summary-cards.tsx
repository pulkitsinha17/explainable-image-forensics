"use client";

import { FileText, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/components/motion-utils";
import type { HistorySummaryStats } from "./types";

interface HistorySummaryCardsProps {
  stats: HistorySummaryStats;
}

export function HistorySummaryCards({ stats }: HistorySummaryCardsProps) {
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
      id: "total",
      title: "Total Analyses",
      value: total.toLocaleString(),
      subtext: "All time records",
      icon: FileText,
      iconBg: "bg-blue-50/90 text-[#1a7fc4]",
      iconBorder: "border-blue-100/80",
      accentBar: "bg-blue-500/20 group-hover:bg-[#1a7fc4]",
      valueColor: "text-slate-900",
    },
    {
      id: "authentic",
      title: "Authentic",
      value: authenticated.toLocaleString(),
      subtext: `${authPercentage}% of all analyses`,
      icon: CheckCircle2,
      iconBg: "bg-emerald-50/90 text-emerald-600",
      iconBorder: "border-emerald-100/80",
      accentBar: "bg-emerald-500/20 group-hover:bg-emerald-500",
      valueColor: "text-slate-900",
    },
    {
      id: "manipulated",
      title: "Manipulated",
      value: manipulated.toLocaleString(),
      subtext: `${manipPercentage}% of all analyses`,
      icon: AlertTriangle,
      iconBg: "bg-rose-50/90 text-rose-600",
      iconBorder: "border-rose-100/80",
      accentBar: "bg-rose-500/20 group-hover:bg-rose-500",
      valueColor: "text-slate-900",
    },
    {
      id: "inconclusive",
      title: "Inconclusive",
      value: inconclusive.toLocaleString(),
      subtext: `${inconclusivePercentage}% of all analyses`,
      icon: AlertCircle,
      iconBg: "bg-slate-50/90 text-slate-600",
      iconBorder: "border-slate-200/80",
      accentBar: "bg-slate-400/20 group-hover:bg-slate-500",
      valueColor: "text-slate-900",
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.06,
        delayChildren: shouldReduceMotion ? 0 : 0.02,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.45,
        ease: EASE_OUT,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            variants={cardVariants}
            className="group bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-slate-300/90 hover:-translate-y-0.5 transition-all duration-200 ease-out cursor-default relative overflow-hidden flex items-center gap-3.5 sm:gap-4"
          >
            {/* Top Micro Accent Line */}
            <div
              className={`absolute top-0 left-0 right-0 h-[2px] transition-colors duration-200 ${card.accentBar}`}
            />

            {/* Icon Box */}
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border ${card.iconBg} ${card.iconBorder} group-hover:scale-105 transition-transform duration-200 ease-out`}
            >
              <Icon className="w-5 h-5 stroke-[2]" />
            </div>

            {/* Metrics Content */}
            <div className="min-w-0 flex-1">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">
                {card.title}
              </p>
              <p className={`text-2xl sm:text-[26px] font-bold ${card.valueColor} tracking-tight mt-0.5 leading-tight`}>
                {card.value}
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                {card.subtext}
              </p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
