"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ImageIcon,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/components/motion-utils";
import type { CompletedAnalysisRecord } from "./types";

interface AnalysisHistoryCardProps {
  analysis: CompletedAnalysisRecord;
}

export function AnalysisHistoryCard({ analysis }: AnalysisHistoryCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);

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
  const scorePct = scoreVal !== null ? Math.min(100, Math.max(0, scoreVal)) : 0;
  const displayId = `PX-${analysis.id.slice(-8).toUpperCase()}`;

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined") {
      const origin = window.location.origin || "http://localhost:3000";
      const shareUrl = `${origin}/analysis/${analysis.id}`;
      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error("Failed to copy link:", err);
        }
      }
    }
  };

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
      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-4.5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative"
    >
      {/* Left section: Visual thumbnail & rich metadata */}
      <div className="flex items-start sm:items-center gap-3.5 sm:gap-4.5 min-w-0 flex-1">
        {/* Thumbnail Frame */}
        <div className="w-24 h-16 sm:w-28 sm:h-18 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative shrink-0 border border-slate-200/80 dark:border-slate-700 shadow-2xs group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-colors">
          {analysis.thumbnailUrl ? (
            <Image
              src={analysis.thumbnailUrl}
              alt={analysis.filename}
              fill
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800">
              <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
            </div>
          )}

          {/* Format Tag Pill */}
          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs">
            {analysis.format}
          </span>
        </div>

        {/* File Details & Metadata */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-[#1a7fc4] dark:group-hover:text-[#5bb8f5] transition-colors tracking-tight">
              {analysis.filename}
            </h3>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
              {displayId}
            </span>
          </div>

          {/* Specs & Dimensions */}
          <div className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px]">
              {analysis.format}
            </span>
            <span className="text-slate-300 dark:text-slate-600 font-bold">·</span>
            <span>{analysis.dimensions}</span>
            <span className="text-slate-300 dark:text-slate-600 font-bold">·</span>
            <span>{analysis.fileSizeFormatted}</span>
          </div>

          {/* Timestamp */}
          <div className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
            <span>Analyzed on {analysis.analyzedAt}</span>
          </div>
        </div>
      </div>

      {/* Right section: Verdict Badge, Forensic Score, and Primary / Secondary Actions */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between md:justify-end gap-3 sm:gap-5 md:gap-7 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
        {/* Verdict Badge */}
        <div className="min-w-[120px]">
          {isForged && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/70 dark:border-rose-800/50">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 stroke-[2]" />
              <span>{analysis.verdictLabel}</span>
            </div>
          )}
          {isAuthentic && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/50">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2]" />
              <span>{analysis.verdictLabel}</span>
            </div>
          )}
          {isInconclusive && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] border border-blue-200/70 dark:border-blue-800/50">
              <AlertCircle className="w-3.5 h-3.5 text-[#1a7fc4] dark:text-[#5bb8f5] shrink-0 stroke-[2]" />
              <span>{analysis.verdictLabel}</span>
            </div>
          )}
        </div>

        {/* Forensic Score Column with mini progress bar */}
        <div className="text-right min-w-[100px]">
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none block">
            {scoreText}
          </span>
          <div className="flex items-center justify-end gap-1.5 mt-1">
            <div className="w-12 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  scorePct >= 60 ? "bg-rose-500" : scorePct >= 35 ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${scorePct}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Score
            </span>
          </div>
        </div>

        {/* Actions Button Group */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopyLink}
            title="Copy share link"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors shadow-2xs cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          <Link
            href={`/report/${analysis.id}?from=history`}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-blue-50/60 dark:hover:bg-slate-750 hover:border-[#1a7fc4]/40 dark:hover:border-[#5bb8f5]/40 hover:text-[#1a7fc4] dark:hover:text-[#5bb8f5] text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all duration-200 shadow-2xs group/btn whitespace-nowrap cursor-pointer hover:shadow-xs active:scale-[0.98]"
          >
            <span>View Analysis</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover/btn:text-[#1a7fc4] dark:group-hover/btn:text-[#5bb8f5] transition-transform duration-200 group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

