import { FileText, BarChart3, AlertTriangle, Percent } from "lucide-react";

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
  const hasAnalyses = (stats?.totalAnalyses ?? 0) > 0;

  const cards = [
    {
      label: "Total Analyses",
      value: stats ? stats.totalAnalyses.toString() : "0",
      change: stats?.totalAnalysesChange,
      subtext: hasAnalyses ? "Total scans performed" : "No analyses yet",
      icon: FileText,
      iconColor: "text-[#1a7fc4]",
      iconBg: "bg-blue-50 text-[#1a7fc4] border border-blue-100/60",
    },
    {
      label: "Analyses This Month",
      value: stats ? stats.analysesThisMonth.toString() : "0",
      change: stats?.analysesThisMonthChange,
      subtext: hasAnalyses ? "Current billing cycle" : "No analyses yet",
      icon: BarChart3,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100/60",
    },
    {
      label: "Manipulated Detected",
      value: stats ? stats.manipulatedDetected.toString() : "0",
      change: stats?.manipulatedDetectedChange,
      subtext: hasAnalyses ? "Flagged as manipulated" : "No analyses yet",
      icon: AlertTriangle,
      iconColor: "text-rose-600",
      iconBg: "bg-rose-50 text-rose-600 border border-rose-100/60",
    },
    {
      label: "Average Forgery Anomaly Score",
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
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50 text-purple-600 border border-purple-100/60",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="group bg-white rounded-2xl p-5.5 sm:p-6 border border-gray-100 shadow-xs hover:shadow-md hover:border-gray-200/90 hover:-translate-y-0.5 transition-all duration-200 ease-in-out cursor-default flex items-start gap-4 min-h-[118px]"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg} group-hover:scale-105 transition-transform duration-200 ease-in-out mt-0.5`}
            >
              <Icon className="w-5.5 h-5.5 stroke-[2]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-500 tracking-tight truncate">
                {card.label}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-[26px] font-bold text-gray-900 tracking-tight leading-none">
                  {card.value}
                </span>
                {card.change !== null && card.change !== undefined && card.change > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
                    <span className="text-[13px] font-bold leading-none select-none">↑</span>
                    <span>{card.change}%</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 font-normal mt-1.5 truncate">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
