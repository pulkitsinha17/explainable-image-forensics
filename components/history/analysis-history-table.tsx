"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ImageIcon,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Copy,
  Check,
  Calendar,
  ExternalLink,
} from "lucide-react";
import type { CompletedAnalysisRecord } from "./types";

interface AnalysisHistoryTableProps {
  analyses: CompletedAnalysisRecord[];
}

export function AnalysisHistoryTable({ analyses }: AnalysisHistoryTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined") {
      const origin = window.location.origin || "http://localhost:3000";
      const shareUrl = `${origin}/analysis/${id}`;
      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopiedId(id);
          setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
          console.error("Failed to copy link:", err);
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs table-auto border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <th className="py-3 px-4 text-left">Evidence / Image</th>
              <th className="py-3 px-4 text-left">Verdict</th>
              <th className="py-3 px-4 text-left">Forensic Score</th>
              <th className="py-3 px-4 text-left hidden md:table-cell">File Details</th>
              <th className="py-3 px-4 text-left hidden sm:table-cell">Date & Time</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/90 text-slate-700">
            {analyses.map((item) => {
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

              const isInconclusive = !isForged && !isAuthentic;

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

              const scorePct = scoreVal !== null ? Math.min(100, Math.max(0, scoreVal)) : 0;
              const displayId = `PX-${item.id.slice(-8).toUpperCase()}`;

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-default"
                >
                  {/* Evidence / Filename Column */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3 min-w-[200px] max-w-[280px]">
                      <div className="w-12 h-9 rounded-lg overflow-hidden bg-slate-100 relative shrink-0 border border-slate-200/80">
                        {item.thumbnailUrl ? (
                          <Image
                            src={item.thumbnailUrl}
                            alt={item.filename}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 truncate group-hover:text-[#1a7fc4] transition-colors text-xs sm:text-sm">
                          {item.filename}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5 tracking-tight">
                          {displayId}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Verdict Column */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {isForged && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/70">
                        <AlertTriangle className="w-3 h-3 text-rose-600 stroke-[2.2]" />
                        {item.verdictLabel || "Manipulated"}
                      </span>
                    )}
                    {isAuthentic && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 stroke-[2.2]" />
                        {item.verdictLabel || "Authentic"}
                      </span>
                    )}
                    {isInconclusive && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#1a7fc4] border border-blue-200/70">
                        <AlertCircle className="w-3 h-3 text-[#1a7fc4] stroke-[2.2]" />
                        {item.verdictLabel || "Inconclusive"}
                      </span>
                    )}
                  </td>

                  {/* Forensic Score Column */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="w-28 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span>{scoreVal !== null ? `${scoreVal.toFixed(1)}%` : "N/A"}</span>
                        <span className="text-[10px] font-medium text-slate-400">
                          {scorePct >= 60 ? "High" : scorePct >= 35 ? "Med" : "Low"}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            scorePct >= 60
                              ? "bg-rose-500"
                              : scorePct >= 35
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${scorePct}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* File Details Column */}
                  <td className="py-3 px-4 whitespace-nowrap hidden md:table-cell text-slate-500 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700 uppercase bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                        {item.format}
                      </span>
                      <span>{item.dimensions}</span>
                      <span className="text-slate-300">·</span>
                      <span>{item.fileSizeFormatted}</span>
                    </div>
                  </td>

                  {/* Date Column */}
                  <td className="py-3 px-4 whitespace-nowrap hidden sm:table-cell text-slate-500 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{item.analyzedAt}</span>
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(item.id, e)}
                        title="Copy analysis link"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors shadow-2xs cursor-pointer"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <Link
                        href={`/report/${item.id}?from=history`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50/60 hover:border-[#1a7fc4]/40 hover:text-[#1a7fc4] text-slate-700 text-xs font-semibold transition-all shadow-2xs group/btn cursor-pointer"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
