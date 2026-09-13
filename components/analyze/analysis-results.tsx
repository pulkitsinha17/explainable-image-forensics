"use client";

import { useState } from "react";
import {
  Download,
  Share2,
  MoreHorizontal,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Check,
} from "lucide-react";
import { ImageComparisonSlider } from "./image-comparison-slider";
import type { ForensicAnalysisResult } from "./types";

interface AnalysisResultsProps {
  results: ForensicAnalysisResult;
  onDownloadReport?: () => void;
  onShare?: () => void;
}

export function AnalysisResults({
  results,
  onDownloadReport,
  onShare,
}: AnalysisResultsProps) {
  const [copied, setCopied] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleShareClick = () => {
    if (onShare) {
      onShare();
    } else {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleDownloadClick = () => {
    if (onDownloadReport) {
      onDownloadReport();
    } else {
      // Generate a formatted summary download
      const reportContent = `PIXENTRA IMAGE FORENSIC REPORT\n===============================\nVerdict: ${results.verdictLabel}\nForgery Risk Score: ${results.forgeryRiskScore}%\nCompleted in: ${results.elapsedSeconds} seconds\n\nEVIDENCE BREAKDOWN:\n- Spatial / Pixel: ${results.evidence.spatial}%\n- Noise: ${results.evidence.noise}%\n- Frequency: ${results.evidence.frequency}%\n- ELA: ${results.evidence.ela}%\n- Statistics: ${results.evidence.statistics}%\n- Metadata: ${results.evidence.metadata}%\n\nAI EXPLANATION:\n${results.aiExplanation}\n\nGenerated with PIXENTRA — See Beyond the Pixels\n`;
      const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pixentra-forensic-report-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const evidenceItems = [
    {
      name: "Spatial / Pixel",
      score: results.evidence.spatial,
      color: "bg-[#ef4444]", // red
    },
    {
      name: "Noise",
      score: results.evidence.noise,
      color: "bg-[#ef4444]", // red
    },
    {
      name: "Frequency",
      score: results.evidence.frequency,
      color: "bg-[#ef4444]", // red
    },
    {
      name: "ELA",
      score: results.evidence.ela,
      color: "bg-[#ef4444]", // red
    },
    {
      name: "Statistics",
      score: results.evidence.statistics,
      color: "bg-[#f59e0b]", // amber / orange
    },
    {
      name: "Metadata",
      score: results.evidence.metadata,
      color: "bg-[#10b981]", // emerald / green
    },
  ];

  // Radial score gauge calculation
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (results.forgeryRiskScore / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6 animate-fade-in">
      {/* Header Row: Title, Status, Completed Time, Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Analysis Results
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Completed in {results.elapsedSeconds} seconds
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleDownloadClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-gray-600" />
            <span>Download Report</span>
          </button>

          <button
            type="button"
            onClick={handleShareClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Share2 className="w-3.5 h-3.5 text-gray-600" />
            )}
            <span>{copied ? "Copied!" : "Share"}</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors shadow-2xs"
              aria-label="More options"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-600" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-30 text-xs text-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    handleShareClick();
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5 text-gray-500" /> Copy Analysis Link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-gray-500" /> Print Summary
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main 2-Column Results Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visual Comparison Slider */}
        <div className="lg:col-span-6 space-y-4">
          <ImageComparisonSlider
            originalImage={results.originalImageUrl}
            heatmapImage={results.localizationMapUrl}
          />
        </div>

        {/* Right Column: Verdict, Forgery Risk, Evidence Breakdown & AI Explanation */}
        <div className="lg:col-span-6 space-y-6">
          {/* Top Row: Verdict + Forgery Risk Gauge */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
            {/* Verdict */}
            <div className="sm:col-span-8 flex flex-col justify-center space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Verdict
              </span>
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5 shrink-0 stroke-[2.2]" />
                <span className="text-base sm:text-lg font-bold">
                  {results.verdictLabel}
                </span>
              </div>
              <p className="text-xs text-gray-600">
                {results.verdictDescription}
              </p>
            </div>

            {/* Forgery Risk Circular Radial Meter */}
            <div className="sm:col-span-4 flex flex-col items-center justify-center pt-2 sm:pt-0 sm:border-l sm:border-gray-200/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Forgery Risk
              </span>
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  {/* Background Track */}
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    className="text-red-100 stroke-current"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  {/* Progress Arc */}
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    className="text-red-500 stroke-current transition-all duration-1000 ease-out"
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-black text-gray-900 tracking-tight">
                    {results.forgeryRiskScore}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Evidence Breakdown + AI Explanation */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
            {/* Evidence Breakdown */}
            <div className="sm:col-span-6 space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                Evidence Breakdown
              </h4>

              <div className="space-y-2.5">
                {evidenceItems.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium text-gray-700">
                      <span className="truncate pr-2">{item.name}</span>
                      <span className="font-semibold text-gray-900 shrink-0">
                        {item.score}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${item.color} h-full rounded-full transition-all duration-700 ease-out`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Explanation */}
            <div className="sm:col-span-6 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1a7fc4]" />
                <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                  AI Explanation
                </h4>
              </div>

              <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-600 leading-relaxed">
                  {results.aiExplanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
