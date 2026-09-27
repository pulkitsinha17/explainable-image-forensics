import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ImageIcon, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import type { CompletedAnalysisRecord } from "@/components/history/types";

export type RecentAnalysisItem = CompletedAnalysisRecord;

interface RecentAnalysesProps {
  analyses?: RecentAnalysisItem[];
}

function getVerdictBadge(item: RecentAnalysisItem) {
  const isForged =
    item.verdict === "forged" ||
    item.verdictLabel === "Likely Manipulated" ||
    item.verdictLabel === "Potentially Forged" ||
    item.verdictLabel === "Manipulated";

  const isAuthentic =
    item.verdict === "authentic" ||
    item.verdictLabel === "Authentic" ||
    item.verdictLabel === "Appears Authentic" ||
    item.verdictLabel === "Authenticated" ||
    item.verdictLabel === "Likely Authentic";

  if (isForged) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200/70 dark:border-rose-900/50 whitespace-nowrap">
        <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
        {item.verdictLabel || "Manipulated"}
      </span>
    );
  }

  if (isAuthentic) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-900/50 whitespace-nowrap">
        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
        {item.verdictLabel || "Authentic"}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-blue-950/50 text-[#1a7fc4] dark:text-[#5bb8f5] border border-blue-200/70 dark:border-blue-900/50 whitespace-nowrap">
      <HelpCircle className="w-3 h-3 text-[#1a7fc4] dark:text-[#5bb8f5] shrink-0" />
      {item.verdictLabel || "Inconclusive"}
    </span>
  );
}

export function RecentAnalyses({ analyses = [] }: RecentAnalysesProps) {
  const hasAnalyses = analyses.length > 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Recent Analyses
          </h3>
        </div>
        <Link
          href="/history"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#1a7fc4] dark:text-[#5bb8f5] hover:text-[#1565a8] dark:hover:text-blue-300 transition-colors group"
        >
          <span>View history</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Content */}
      <div className="pt-3 flex-1 flex flex-col justify-center">
        {!hasAnalyses ? (
          /* Empty State */
          <div className="py-8 sm:py-10 px-4 text-center flex flex-col items-center justify-center max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-400 dark:text-gray-500 mb-4 shadow-2xs">
              <ImageIcon className="w-7 h-7 stroke-[1.5]" />
            </div>

            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              No analyses yet
            </h4>

            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Your forensic investigations will appear here.
            </p>

            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a7fc4] hover:bg-[#1565a8] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all group"
            >
              <span>Analyze your first image</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        ) : (
          /* Table of recent items */
          <div className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full text-left text-xs sm:text-sm table-auto">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 dark:text-gray-500 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="pb-2.5 pl-1">Evidence</th>
                  <th className="pb-2.5 text-left">Verdict</th>
                  <th className="pb-2.5 text-center px-2">Score</th>
                  <th className="pb-2.5 pr-1 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
                {analyses.map((item) => {
                  const scoreVal =
                    item.forensicManipulationScore !== null && item.forensicManipulationScore !== undefined
                      ? item.forensicManipulationScore
                      : item.manipulationProbability !== null && item.manipulationProbability !== undefined
                      ? item.manipulationProbability
                      : item.forgeryAnomalyScore !== null && item.forgeryAnomalyScore !== undefined
                      ? item.forgeryAnomalyScore
                      : typeof item.riskScore === "number" && item.riskScore >= 0
                      ? item.riskScore
                      : null;

                  const scoreDisplay = scoreVal !== null ? `${scoreVal.toFixed(1)}%` : "—";
                  const dateParts = item.analyzedAt ? item.analyzedAt.split(" at ") : [];
                  const dateStr = dateParts[0] || (item.analyzedTimestamp ? "Recent" : "—");
                  const timeStr = dateParts[1] || "";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    >
                      <td className="py-2.5 pl-1">
                        <Link
                          href={`/report/${item.id}?from=dashboard`}
                          className="flex items-center gap-2.5 min-w-0"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 overflow-hidden relative shrink-0 border border-gray-200/60 dark:border-slate-700 shadow-2xs">
                            {item.thumbnailUrl ? (
                              <Image
                                src={item.thumbnailUrl}
                                alt={item.filename}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-800">
                                <ImageIcon className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white group-hover:text-[#1a7fc4] dark:group-hover:text-[#5bb8f5] transition-colors truncate max-w-[100px] sm:max-w-[150px]">
                            {item.filename}
                          </span>
                        </Link>
                      </td>
                      <td className="py-2.5 text-left">
                        <Link href={`/report/${item.id}?from=dashboard`}>
                          {getVerdictBadge(item)}
                        </Link>
                      </td>
                      <td className="py-2.5 text-center px-2">
                        <Link href={`/report/${item.id}?from=dashboard`}>
                          <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs font-mono">
                            {scoreDisplay}
                          </span>
                        </Link>
                      </td>
                      <td className="py-2.5 pr-1 text-right">
                        <Link
                          href={`/report/${item.id}?from=dashboard`}
                          className="inline-block text-right"
                        >
                          {item.analyzedAt ? (
                            <>
                              <span className="block font-medium text-gray-700 dark:text-gray-300 text-xs whitespace-nowrap">
                                {dateStr}
                              </span>
                              {timeStr && (
                                <span className="block text-[10px] text-gray-400 dark:text-gray-500 font-normal whitespace-nowrap leading-none mt-0.5">
                                  {timeStr}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                          )}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}



