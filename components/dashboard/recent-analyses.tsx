import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ImageIcon, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import type { CompletedAnalysisRecord } from "@/components/history/types";

export type RecentAnalysisItem = CompletedAnalysisRecord;

interface RecentAnalysesProps {
  analyses?: RecentAnalysisItem[];
}

function getRelativeTime(timestamp?: number): string {
  if (!timestamp) return "";
  const now = Date.now();
  const diffMs = now - timestamp;
  if (diffMs < 0) return "Just now";

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min${diffMin === 1 ? "" : "s"} ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;

  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} year${diffYears === 1 ? "" : "s"} ago`;
}

function getVerdictBadge(item: RecentAnalysisItem) {
  const isForged =
    item.verdict === "forged" ||
    item.verdictLabel === "Likely Manipulated" ||
    item.verdictLabel === "Potentially Forged" ||
    item.verdictLabel === "Manipulated";

  const isAuthentic =
    item.verdict === "authentic" ||
    item.verdictLabel === "Appears Authentic" ||
    item.verdictLabel === "Authenticated" ||
    item.verdictLabel === "Likely Authentic";

  if (isForged) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/70 whitespace-nowrap">
        <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
        {item.verdictLabel || "Likely Manipulated"}
      </span>
    );
  }

  if (isAuthentic) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70 whitespace-nowrap">
        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
        {item.verdictLabel || "Appears Authentic"}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-[#1a7fc4] border border-blue-200/70 whitespace-nowrap">
      <HelpCircle className="w-3 h-3 text-[#1a7fc4] shrink-0" />
      {item.verdictLabel || "Inconclusive"}
    </span>
  );
}

export function RecentAnalyses({ analyses = [] }: RecentAnalysesProps) {
  const hasAnalyses = analyses.length > 0;

  return (
    <div className="bg-white rounded-3xl border border-gray-100/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900">
            Recent Analyses
          </h3>
        </div>
        <Link
          href="/history"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#1a7fc4] hover:text-[#1565a8] transition-colors group"
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
            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mb-4 shadow-2xs">
              <ImageIcon className="w-7 h-7 stroke-[1.5]" />
            </div>

            <h4 className="text-base font-bold text-gray-900 mb-1">
              No analyses yet
            </h4>

            <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
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
          <div className="w-full">
            <table className="w-full text-left text-xs sm:text-sm table-auto">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="pb-2.5 pl-1">Evidence</th>
                  <th className="pb-2.5 text-left">Verdict</th>
                  <th className="pb-2.5 text-center px-2">Score</th>
                  <th className="pb-2.5 pr-1 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {analyses.map((item) => {
                  const scoreDisplay =
                    item.forgeryAnomalyScore !== null && item.forgeryAnomalyScore !== undefined
                      ? `${item.forgeryAnomalyScore}%`
                      : typeof item.riskScore === "number" && item.riskScore >= 0
                      ? `${item.riskScore}%`
                      : "—";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/60 transition-colors group cursor-pointer"
                    >
                      <td className="py-2.5 pl-1">
                        <Link
                          href={`/report/${item.id}?from=dashboard`}
                          className="flex items-center gap-2.5 min-w-0"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden relative shrink-0 border border-gray-200/60 shadow-2xs">
                            {item.thumbnailUrl ? (
                              <Image
                                src={item.thumbnailUrl}
                                alt={item.filename}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                <ImageIcon className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-gray-900 group-hover:text-[#1a7fc4] transition-colors truncate max-w-[110px] sm:max-w-[150px]">
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
                          <span className="font-semibold text-gray-800 text-xs">
                            {scoreDisplay}
                          </span>
                        </Link>
                      </td>
                      <td className="py-2.5 pr-1 text-right">
                        <Link
                          href={`/report/${item.id}?from=dashboard`}
                          className="inline-block text-right"
                        >
                          {item.analyzedTimestamp ? (
                            <>
                              <span className="block font-medium text-gray-700 text-xs whitespace-nowrap">
                                {new Date(item.analyzedTimestamp).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              <span className="block text-[10px] text-gray-400 font-normal whitespace-nowrap leading-none mt-0.5">
                                {getRelativeTime(item.analyzedTimestamp)}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
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



