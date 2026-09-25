"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ImageIcon, Calendar, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/components/motion-utils";
import type { CompletedAnalysisRecord } from "./types";

interface AnalysisHistoryCardProps {
  analysis: CompletedAnalysisRecord;
}

export function AnalysisHistoryCard({ analysis }: AnalysisHistoryCardProps) {
  const shouldReduceMotion = useReducedMotion();

  const isForged =
    analysis.verdict === "forged" ||
    analysis.verdictLabel === "Likely Manipulated" ||
    analysis.verdictLabel === "Potentially Forged" ||
    analysis.verdictLabel === "Manipulated";

  const isAuthentic =
    analysis.verdict === "authentic" ||
    analysis.verdictLabel === "Authentic" ||
    analysis.verdictLabel === "Appears Authentic" ||
    analysis.verdictLabel === "Authenticated" ||
    analysis.verdictLabel === "Likely Authentic";

  const isInconclusive = !isForged && !isAuthentic;

  const scoreVal =
    analysis.forensicManipulationScore !== null && analysis.forensicManipulationScore !== undefined
      ? analysis.forensicManipulationScore
      : analysis.manipulationProbability !== null && analysis.manipulationProbability !== undefined
      ? analysis.manipulationProbability
      : analysis.forgeryAnomalyScore !== null && analysis.forgeryAnomalyScore !== undefined
      ? analysis.forgeryAnomalyScore
      : typeof analysis.riskScore === "number" && analysis.riskScore >= 0
      ? analysis.riskScore
      : null;

  const scoreText = scoreVal !== null ? `${scoreVal.toFixed(1)}%` : "Not available";

  const cardVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.35,
        ease: EASE_OUT,
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      className="group bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative"
    >
      {/* Left side: Thumbnail + File details & metadata */}
      <div className="flex items-start sm:items-center gap-3.5 sm:gap-4.5 min-w-0 flex-1">
        {/* Thumbnail Box */}
        <div className="w-24 h-16 sm:w-28 sm:h-18 rounded-xl overflow-hidden bg-slate-100 relative shrink-0 border border-slate-200/80 shadow-2xs group-hover:border-slate-300 transition-colors">
          {analysis.thumbnailUrl ? (
            <Image
              src={analysis.thumbnailUrl}
              alt={analysis.filename}
              fill
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
              <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
            </div>
          )}

          {/* Format Badge Overlay */}
          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs">
            {analysis.format}
          </span>
        </div>

        {/* File Metadata Details */}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate group-hover:text-[#1a7fc4] transition-colors tracking-tight">
            {analysis.filename}
          </h3>

          <div className="text-xs text-slate-500 font-normal mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
              {analysis.format}
            </span>
            <span className="text-slate-300 font-bold">·</span>
            <span>{analysis.dimensions}</span>
            <span className="text-slate-300 font-bold">·</span>
            <span>{analysis.fileSizeFormatted}</span>
          </div>

          <div className="text-[11px] sm:text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Analyzed on {analysis.analyzedAt}</span>
          </div>
        </div>
      </div>

      {/* Right side: Verdict badge + Forensic Score + View Analysis CTA */}
      <div className="flex items-center justify-between md:justify-end gap-5 sm:gap-8 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
        {/* Verdict & Score */}
        <div className="text-left md:text-left min-w-[130px]">
          {/* Verdict Pill Badge */}
          {isForged && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/70">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 stroke-[2]" />
              <span>{analysis.verdictLabel}</span>
            </div>
          )}
          {isAuthentic && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2]" />
              <span>{analysis.verdictLabel}</span>
            </div>
          )}
          {isInconclusive && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#1a7fc4] border border-blue-200/70">
              <AlertCircle className="w-3.5 h-3.5 text-[#1a7fc4] shrink-0 stroke-[2]" />
              <span>{analysis.verdictLabel}</span>
            </div>
          )}

          {/* Forensic Manipulation Score and Label */}
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-none block">
              {scoreText}
            </span>
            <span className="block text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
              Forensic Score
            </span>
          </div>
        </div>

        {/* View Analysis Button linking to /report/[analysisId]?from=history */}
        <div>
          <Link
            href={`/report/${analysis.id}?from=history`}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-blue-50/60 hover:border-[#1a7fc4]/40 hover:text-[#1a7fc4] text-slate-700 text-xs sm:text-sm font-semibold transition-all duration-200 shadow-2xs group/btn whitespace-nowrap cursor-pointer hover:shadow-xs active:scale-[0.98]"
          >
            <span>View Analysis</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-[#1a7fc4] transition-transform duration-200 group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
