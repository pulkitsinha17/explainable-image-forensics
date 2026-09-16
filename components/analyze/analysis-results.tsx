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
  ArrowLeft,
} from "lucide-react";
import { ImageComparisonSlider } from "./image-comparison-slider";
import type { ForensicAnalysisResult } from "./types";

interface AnalysisResultsProps {
  results: ForensicAnalysisResult;
  onDownloadReport?: () => void;
  onShare?: () => void;
  onAnalyzeAnother?: () => void;
}

export function AnalysisResults({
  results,
  onDownloadReport,
  onShare,
  onAnalyzeAnother,
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
      const reportContent = `PIXENTRA IMAGE FORENSIC REPORT\n===============================\nVerdict: ${results.verdictLabel}\nForgery Anomaly Score: ${results.forgeryRiskScore}%\nPrediction Certainty: ${results.confidence}%\nCompleted in: ${results.elapsedSeconds} seconds\n\nEVIDENCE BREAKDOWN:\n- Compression: ${results.evidence.compression}%\n- Frequency / Noise: ${results.evidence.frequencyNoise}%\n- Local Statistics: ${results.evidence.statistics}%\n- Error Level Analysis (ELA): ${results.evidence.ela}%\n- Metadata: ${results.evidence.metadata}%\n\nAI EXPLANATION:\n${results.aiExplanation}\n\nGenerated with PIXENTRA — See Beyond the Pixels\n`;
      const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pixentra-forensic-report-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Expose the five evidence channels used by the StrongMultiEvidenceNet model
  const evidenceItems = [
    {
      name: "Compression",
      score: results.evidence.compression,
      color: results.evidence.compression > 60 ? "bg-[#ef4444]" : results.evidence.compression > 30 ? "bg-[#f59e0b]" : "bg-[#10b981]",
    },
    {
      name: "Frequency / Noise",
      score: results.evidence.frequencyNoise,
      color: results.evidence.frequencyNoise > 60 ? "bg-[#ef4444]" : results.evidence.frequencyNoise > 30 ? "bg-[#f59e0b]" : "bg-[#10b981]",
    },
    {
      name: "Local Statistics",
      score: results.evidence.statistics,
      color: results.evidence.statistics > 60 ? "bg-[#ef4444]" : results.evidence.statistics > 30 ? "bg-[#f59e0b]" : "bg-[#10b981]",
    },
    {
      name: "Error Level Analysis (ELA)",
      score: results.evidence.ela,
      color: results.evidence.ela > 60 ? "bg-[#ef4444]" : results.evidence.ela > 30 ? "bg-[#f59e0b]" : "bg-[#10b981]",
    },
    {
      name: "Metadata",
      score: results.evidence.metadata,
      color: results.evidence.metadata > 60 ? "bg-[#ef4444]" : results.evidence.metadata > 30 ? "bg-[#f59e0b]" : "bg-[#10b981]",
    },
  ];

  // Radial score gauge calculation
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (results.forgeryRiskScore / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4 animate-fade-in">
      {/* Header Row: Title, Status, Completed Time, Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Analysis Results
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Completed in {results.elapsedSeconds} seconds
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleDownloadClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-gray-600" />
            <span>Download Report</span>
          </button>

          <button
            type="button"
            onClick={handleShareClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
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
              className="p-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors shadow-2xs"
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual Comparison Slider */}
        <div className="lg:col-span-6 space-y-3">
          <ImageComparisonSlider
            originalImage={results.originalImageUrl}
            heatmapImage={results.localizationMapUrl}
          />
        </div>

        {/* Right Column: Verdict, Forgery Risk, Evidence Breakdown & AI Explanation */}
        <div className="lg:col-span-6 space-y-3.5">
          {/* Top Row: Verdict + Forgery Anomaly Score Gauge */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100">
            {/* Verdict */}
            <div className="sm:col-span-7 flex flex-col justify-center space-y-1 sm:pr-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Verdict
              </span>
              <div
                className={`flex items-center gap-2 ${
                  results.verdict === "authentic"
                    ? "text-[#16a34a]"
                    : results.verdict === "suspicious"
                    ? "text-[#2563eb]"
                    : "text-[#dc2626]"
                }`}
              >
                {results.verdict === "authentic" ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 stroke-[2.2]" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0 stroke-[2.2]" />
                )}
                <span className="text-base sm:text-lg font-bold">
                  {results.verdictLabel}
                </span>
              </div>
              <p className="text-xs text-gray-600">
                {results.verdictDescription}
              </p>
            </div>

            {/* Forgery Anomaly Score Circular Radial Meter */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center pt-2 sm:pt-0 sm:pl-3 sm:border-l sm:border-gray-200/60">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1 whitespace-nowrap text-center">
                Forgery Anomaly Score
              </span>
              <div className="relative w-18 h-18 flex items-center justify-center">
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
                  <span className="text-base font-black text-gray-900 tracking-tight">
                    {results.forgeryRiskScore}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ML Metrics Row: Prediction Certainty + Detected Forged Area + Analysis Speed */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-blue-50/50 border border-blue-100/80">
            <div className="flex flex-col items-center gap-0.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Prediction Certainty</span>
              <span className="text-base sm:text-lg font-black text-[#1a7fc4]">{results.confidence}%</span>
              <span className="text-[10px] text-gray-500">Model certainty</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 text-center border-x border-blue-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Forged Area</span>
              <span className="text-base sm:text-lg font-black text-orange-500">{results.forgeryPixelFraction}%</span>
              <span className="text-[10px] text-gray-500">Detected pixels</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Speed</span>
              <span className="text-base sm:text-lg font-black text-emerald-600">{results.elapsedSeconds}s</span>
              <span className="text-[10px] text-gray-500">Analysis time</span>
            </div>
          </div>

          {/* Bottom Row: Evidence Breakdown + AI Explanation */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
            {/* Evidence Breakdown */}
            <div className="sm:col-span-6 space-y-2.5">
              <h4 className="text-xs font-bold text-gray-900">
                Evidence Breakdown
              </h4>

              <div className="space-y-2">
                {evidenceItems.map((item) => (
                  <div key={item.name} className="space-y-0.5">
                    <div className="flex items-center justify-between text-xs font-medium text-gray-700">
                      <span className="truncate pr-2 text-[11px]">{item.name}</span>
                      <span className="font-semibold text-gray-900 shrink-0 text-[11px]">
                        {item.score}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
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
            <div className="sm:col-span-6 space-y-2.5">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#1a7fc4]" />
                <h4 className="text-xs font-bold text-gray-900">
                  AI Explanation
                </h4>
              </div>

              <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
                  {results.aiExplanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action: Analyze Another Image inside the Result Card directly below main content */}
      {onAnalyzeAnother && (
        <div className="pt-4 border-t border-gray-100 flex justify-center">
          <button
            type="button"
            onClick={onAnalyzeAnother}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-900 transition-all shadow-2xs hover:shadow-xs active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
            <span>Analyze Another Image</span>
          </button>
        </div>
      )}
    </div>
  );
}
