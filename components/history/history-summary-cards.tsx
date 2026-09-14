import { FileText, CheckCircle2, AlertTriangle, BarChart2 } from "lucide-react";
import type { HistorySummaryStats } from "./types";

interface HistorySummaryCardsProps {
  stats: HistorySummaryStats;
}

export function HistorySummaryCards({ stats }: HistorySummaryCardsProps) {
  const forgedPercentage =
    stats.completedCount > 0
      ? Math.round((stats.potentiallyForgedCount / stats.completedCount) * 100)
      : 0;

  const cards = [
    {
      title: "Total Analyses",
      value: stats.totalAnalyses.toString(),
      subtext: "All time",
      icon: FileText,
      iconBg: "bg-blue-50 text-[#1a7fc4]",
      iconBorder: "border-blue-100/60",
    },
    {
      title: "Completed",
      value: stats.completedCount.toString(),
      subtext: "100% success rate",
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 text-emerald-600",
      iconBorder: "border-emerald-100/60",
    },
    {
      title: "Potentially Forged",
      value: stats.potentiallyForgedCount.toString(),
      subtext: `${forgedPercentage}% of completed`,
      icon: AlertTriangle,
      iconBg: "bg-rose-50 text-rose-600",
      iconBorder: "border-rose-100/60",
    },
    {
      title: "Average Risk",
      value: `${stats.averageRiskPercentage}%`,
      subtext: "Across all analyses",
      icon: BarChart2,
      iconBg: "bg-purple-50 text-purple-600",
      iconBorder: "border-purple-100/60",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex items-center gap-4 hover:border-gray-200/80 transition-all"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${card.iconBg} ${card.iconBorder}`}
            >
              <Icon className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-500 tracking-tight">
                {card.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight mt-0.5">
                {card.value}
              </p>
              <p className="text-[11px] text-gray-400 font-normal mt-0.5 truncate">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
