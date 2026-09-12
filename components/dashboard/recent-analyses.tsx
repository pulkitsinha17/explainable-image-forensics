import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ImageIcon, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";

export interface RecentAnalysisItem {
  id: string;
  filename: string;
  thumbnailUrl?: string;
  verdict?: "authentic" | "forged" | "inconclusive" | string;
  riskScore?: number;
  createdAt: string | Date;
}

interface RecentAnalysesProps {
  analyses?: RecentAnalysisItem[];
}

function getVerdictBadge(verdict?: string, riskScore?: number) {
  const score = riskScore ?? 0;
  if (verdict === "authentic" || score < 0.35) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        Likely Authentic
      </span>
    );
  }

  if (verdict === "forged" || score >= 0.65) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/70">
        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
        Likely Manipulated
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/70">
      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
      Suspicious
    </span>
  );
}

export function RecentAnalyses({ analyses = [] }: RecentAnalysesProps) {
  const hasAnalyses = analyses.length > 0;

  return (
    <div className="bg-white rounded-3xl border border-gray-100/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-gray-100">
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
      <div className="py-6 flex-1 flex flex-col justify-center">
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
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="pb-3 pl-2">Evidence</th>
                  <th className="pb-3">Verdict</th>
                  <th className="pb-3">Risk Score</th>
                  <th className="pb-3 pr-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {analyses.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/60 transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden relative shrink-0 border border-gray-200/60">
                          {item.thumbnailUrl ? (
                            <Image
                              src={item.thumbnailUrl}
                              alt={item.filename}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-gray-900 group-hover:text-[#1a7fc4] transition-colors truncate max-w-[150px] sm:max-w-[200px]">
                          {item.filename}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      {getVerdictBadge(item.verdict, item.riskScore)}
                    </td>
                    <td className="py-3.5">
                      <span className="font-semibold text-gray-800">
                        {item.riskScore !== undefined
                          ? `${Math.round(item.riskScore * 100)}%`
                          : "—"}
                      </span>
                    </td>
                    <td className="py-3.5 pr-2 text-right text-xs text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
