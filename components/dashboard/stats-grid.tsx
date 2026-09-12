import { FileText, BarChart3, AlertTriangle, Percent } from "lucide-react";

export interface DashboardStats {
  totalAnalyses: number;
  analysesThisMonth: number;
  manipulatedDetected: number;
  averageRiskScore: number | null;
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
      subtext: hasAnalyses ? "Total scans performed" : "No analyses yet",
      icon: FileText,
      iconColor: "text-[#1a7fc4]",
      iconBg: "bg-blue-50/80 border border-blue-100/60",
    },
    {
      label: "Analyses This Month",
      value: stats ? stats.analysesThisMonth.toString() : "0",
      subtext: hasAnalyses ? "Current billing cycle" : "No analyses yet",
      icon: BarChart3,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50/80 border border-emerald-100/60",
    },
    {
      label: "Manipulated Detected",
      value: stats ? stats.manipulatedDetected.toString() : "0",
      subtext: hasAnalyses ? "Flagged as manipulated" : "No analyses yet",
      icon: AlertTriangle,
      iconColor: "text-rose-600",
      iconBg: "bg-rose-50/80 border border-rose-100/60",
    },
    {
      label: "Average Risk Score",
      value:
        stats && stats.averageRiskScore !== null
          ? `${Math.round(stats.averageRiskScore * 100)}%`
          : "—",
      subtext:
        stats && stats.averageRiskScore !== null
          ? "Across all investigations"
          : "Not available yet",
      icon: Percent,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50/80 border border-purple-100/60",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white rounded-2xl p-5 border border-gray-100/90 shadow-xs hover:shadow-sm hover:border-gray-200 transition-all flex items-start gap-4"
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}
            >
              <Icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 truncate">
                {card.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight mt-0.5">
                {card.value}
              </p>
              <p className="text-[11px] text-gray-400 mt-1 truncate">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
