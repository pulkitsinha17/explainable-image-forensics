import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ImageIcon } from "lucide-react";
import type { CompletedAnalysisRecord } from "./types";

interface AnalysisHistoryCardProps {
  analysis: CompletedAnalysisRecord;
}

export function AnalysisHistoryCard({ analysis }: AnalysisHistoryCardProps) {
  const isForged =
    analysis.verdict === "forged" ||
    analysis.verdictLabel === "Likely Manipulated" ||
    analysis.verdictLabel === "Potentially Forged" ||
    analysis.verdictLabel === "Manipulated";

  const isAuthentic =
    analysis.verdict === "authentic" ||
    analysis.verdictLabel === "Appears Authentic" ||
    analysis.verdictLabel === "Authenticated" ||
    analysis.verdictLabel === "Likely Authentic";

  const isInconclusive = !isForged && !isAuthentic;

  const scoreText =
    analysis.forgeryAnomalyScore !== null && analysis.forgeryAnomalyScore !== undefined
      ? `${analysis.forgeryAnomalyScore}%`
      : typeof analysis.riskScore === "number" && analysis.riskScore >= 0
      ? `${analysis.riskScore}%`
      : "Not available";

  return (
    <div className="bg-white rounded-2xl border border-gray-100/90 p-4 sm:p-5 shadow-xs hover:border-gray-200/90 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
      {/* Left side: Thumbnail + File details */}
      <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
        <div className="w-24 h-16 sm:w-28 sm:h-18 rounded-xl overflow-hidden bg-gray-100 relative shrink-0 border border-gray-200/60 shadow-2xs">
          {analysis.thumbnailUrl ? (
            <Image
              src={analysis.thumbnailUrl}
              alt={analysis.filename}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
              <ImageIcon className="w-6 h-6" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
            {analysis.filename}
          </h3>
          <p className="text-xs text-gray-500 font-normal mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-gray-600 uppercase tracking-wider text-[11px]">
              {analysis.format}
            </span>
            <span className="text-gray-300">·</span>
            <span>{analysis.dimensions}</span>
            <span className="text-gray-300">·</span>
            <span>{analysis.fileSizeFormatted}</span>
          </p>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
            Analyzed on {analysis.analyzedAt}
          </p>
        </div>
      </div>

      {/* Right side: Verdict badge + Forgery Anomaly Score + View Analysis Action */}
      <div className="flex items-center justify-between md:justify-end gap-6 sm:gap-8 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 shrink-0">
        {/* Verdict & Score */}
        <div className="text-left md:text-left min-w-[130px]">
          {/* Verdict Pill Badge */}
          {isForged && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/70">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>{analysis.verdictLabel}</span>
            </div>
          )}
          {isAuthentic && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{analysis.verdictLabel}</span>
            </div>
          )}
          {isInconclusive && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#1a7fc4] border border-blue-200/70">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1a7fc4]" />
              <span>{analysis.verdictLabel}</span>
            </div>
          )}

          {/* Forgery Anomaly Score and Label */}
          <div className="mt-1">
            <span className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {scoreText}
            </span>
            <span className="block text-[11px] font-medium text-gray-400 tracking-tight">
              Forgery Anomaly Score
            </span>
          </div>
        </div>

        {/* View Analysis Button linking directly to /report/[analysisId] */}
        <div>
          <Link
            href={`/report/${analysis.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-blue-200 bg-white hover:bg-[#eef6fc] hover:border-[#1a7fc4]/40 text-[#1a7fc4] text-xs sm:text-sm font-semibold transition-all shadow-2xs group whitespace-nowrap cursor-pointer"
          >
            <span>View Analysis</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
