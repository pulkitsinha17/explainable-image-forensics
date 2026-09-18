import { FileText, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import type { HistorySummaryStats } from "./types";

interface HistorySummaryCardsProps {
  stats: HistorySummaryStats;
}

export function HistorySummaryCards({ stats }: HistorySummaryCardsProps) {
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
      title: "Total Analyses",
      value: total.toString(),
      subtext: "All time",
      icon: FileText,
      iconBg: "bg-blue-50 text-[#1a7fc4]",
      iconBorder: "border-blue-100/60",
    },
    {
      title: "Authenticated",
      value: authenticated.toString(),
      subtext: `${authPercentage}% of total`,
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 text-emerald-600",
      iconBorder: "border-emerald-100/60",
    },
    {
      title: "Manipulated",
      value: manipulated.toString(),
      subtext: `${manipPercentage}% of total`,
      icon: AlertTriangle,
      iconBg: "bg-rose-50 text-rose-600",
      iconBorder: "border-rose-100/60",
    },
    {
      title: "Inconclusive",
      value: inconclusive.toString(),
      subtext: `${inconclusivePercentage}% of total`,
      icon: AlertCircle,
      iconBg: "bg-slate-50 text-slate-600",
      iconBorder: "border-slate-200/60",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:shadow-md hover:border-gray-200/90 hover:-translate-y-0.5 transition-all duration-200 ease-in-out cursor-default flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${card.iconBg} ${card.iconBorder} group-hover:scale-105 transition-transform duration-200 ease-in-out`}
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
