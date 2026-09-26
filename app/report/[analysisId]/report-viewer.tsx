"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Share2,
  Check,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { ForensicAnalysisResult } from "@/components/analyze/types";
import {
  buildForensicPdfDoc,
  downloadForensicPdfReport,
} from "@/lib/pdf/generate-forensic-report";

export function ReportViewer({ analysisId }: { analysisId: string }) {
  const searchParams = useSearchParams();
  const fromHistory = searchParams?.get("from") === "history";
  const backHref = fromHistory ? "/history" : `/analysis/${analysisId}`;
  const backLabel = fromHistory ? "Back to History" : "Back to Analysis";
  const errorBackLabel = fromHistory ? "Return to History" : "Return to Analysis";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ForensicAnalysisResult | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchAndRenderReport() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/analyze/${analysisId}`);
        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = `/sign-in?redirect_url=${encodeURIComponent(window.location.href)}`;
            return;
          }
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load analysis report.");
        }

        const data = await res.json();
        if (!data.result) {
          throw new Error("Report data not found.");
        }

        if (!active) return;
        setAnalysisResult(data.result);

        // Generate PDF instance using the unified single-source PDF builder
        const doc = await buildForensicPdfDoc(data.result);
        const blob = doc.output("blob");
        const blobUrl = URL.createObjectURL(blob);

        if (!active) return;
        setPdfBlobUrl(blobUrl);
      } catch (err) {
        if (!active) return;
        console.error("Failed to load report:", err);
        setError(err instanceof Error ? err.message : "Failed to load report.");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchAndRenderReport();

    return () => {
      active = false;
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [analysisId]);

  const handleShareClick = async () => {
    if (typeof window !== "undefined") {
      const origin =
        window.location.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const shareUrl = `${origin}/analysis/${analysisId}`;

      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch (err) {
          console.error("Failed to copy link:", err);
        }
      }
    }
  };

  const handleDownloadClick = async () => {
    if (!analysisResult) return;
    try {
      setIsDownloading(true);
      await downloadForensicPdfReport(analysisResult);
    } catch (err) {
      console.error("Failed to download PDF report:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const reportId = `PX-${(analysisResult?.analysisId || analysisId).slice(-8).toUpperCase()}`;

  return (
    <div className="space-y-4">
      {/* Top Header Row with Breadcrumb Link, Page Title, and PIXENTRA Standard Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
        <div>
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{backLabel}</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Forensic Report
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Detailed Multi-Evidence Analysis Report • Report ID: {reportId}
          </p>
        </div>

        {/* Action Buttons: [ Download PDF ] [ Share ] */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleDownloadClick}
            disabled={isDownloading || !analysisResult}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-60 text-gray-700 text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer disabled:cursor-not-allowed"
          >
            <Download className={`w-3.5 h-3.5 text-gray-600 ${isDownloading ? "animate-pulse" : ""}`} />
            <span>{isDownloading ? "Downloading..." : "Download PDF"}</span>
          </button>

          <button
            type="button"
            onClick={handleShareClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Share2 className="w-3.5 h-3.5 text-gray-600" />
            )}
            <span>{copied ? "Analysis link copied" : "Share"}</span>
          </button>
        </div>
      </div>

      {/* Main Report Content Container — Clean PIXENTRA White Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-semibold text-gray-700">Rendering forensic analysis report...</p>
            <p className="text-xs text-gray-400">Preparing single-page PDF preview</p>
          </div>
        ) : error ? (
          <div className="border border-red-100 bg-red-50/40 rounded-2xl p-6 text-center space-y-3 max-w-md mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">Failed to load report</h3>
            <p className="text-xs text-red-600">{error}</p>
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> {errorBackLabel}
            </Link>
          </div>
        ) : pdfBlobUrl ? (
          <div className="space-y-3">
            {/* Document Header Metadata inside Card */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-1 text-xs text-gray-500 border-b border-gray-100 pb-2.5">
              <div className="flex items-center gap-2 min-w-0 truncate">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-medium text-gray-800 truncate">
                  pixentra-forensic-report-{reportId}.pdf
                </span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-600 shrink-0">
                Page 1 of 1 (A4)
              </span>
            </div>

            {/* Embedded PDF Viewer */}
            <div className="w-full rounded-xl overflow-hidden border border-gray-200/80 bg-gray-50/50 shadow-inner">
              <iframe
                src={`${pdfBlobUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                title="Forensic Analysis Report"
                className="w-full bg-white border-0 min-h-[500px] h-[65vh] sm:h-[820px]"
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
