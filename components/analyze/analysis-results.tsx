"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Share2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Check,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { ImageComparisonSlider } from "./image-comparison-slider";
import type { ForensicAnalysisResult } from "./types";
import { downloadForensicPdfReport } from "@/lib/pdf/generate-forensic-report";

interface AnalysisResultsProps {
  results: ForensicAnalysisResult;
  onViewReport?: () => void;
  onDownloadReport?: () => void;
  onShare?: () => void;
  onAnalyzeAnother?: () => void;
}

export function AnalysisResults({
  results,
  onViewReport,
  onDownloadReport,
  onShare,
  onAnalyzeAnother,
}: AnalysisResultsProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState<"useful" | "not_useful" | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleViewReport = () => {
    if (onViewReport) {
      onViewReport();
    } else if (results.analysisId) {
      router.push(`/report/${results.analysisId}`);
    }
  };

  const handleShareClick = async () => {
    if (onShare) {
      onShare();
      return;
    }

    if (typeof window !== "undefined") {
      const origin =
        window.location.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const shareUrl = `${origin}/analysis/${results.analysisId || ""}`;

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
    if (onDownloadReport) {
      onDownloadReport();
      return;
    }

    try {
      setIsGeneratingPdf(true);
      await downloadForensicPdfReport(results);
    } catch (err) {
      console.error("Failed to generate forensic PDF report:", err);
      // Graceful fallback download
      const reportContent = `PIXENTRA IMAGE FORENSIC REPORT\n===============================\nVerdict: ${results.verdictLabel}\nForensic Manipulation Score: ${forensicScore.toFixed(1)}%\nForensic Authenticity Score: ${forensicAuthScore.toFixed(1)}%\nPrediction Certainty: ${certVal}%\nCompleted in: ${results.elapsedSeconds} seconds\n\nEVIDENCE BREAKDOWN:\n- Compression: ${results.evidence.compression}%\n- Frequency / Noise: ${results.evidence.frequencyNoise}%\n- Local Statistics: ${results.evidence.statistics}%\n- Error Level Analysis (ELA): ${results.evidence.ela}%\n- Metadata: ${results.evidence.metadata}%\n\nAI EXPLANATION:\n${results.aiExplanation}\n\nGenerated with PIXENTRA — See Beyond the Pixels\n`;
      const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pixentra-forensic-report-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackRating || !results.analysisId) return;

    try {
      setIsSubmittingFeedback(true);
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisId: results.analysisId,
          rating: feedbackRating,
          comment: feedbackComment.trim() || undefined,
        }),
      });

      if (res.ok) {
        setFeedbackSubmitted(true);
      } else {
        console.error("Failed to submit feedback:", await res.text());
      }
    } catch (err) {
      console.error("Feedback submit error:", err);
    } finally {
      setIsSubmittingFeedback(false);
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

  const forensicScore = results.forensicManipulationScore ?? results.forgeryRiskScore;
  const forensicAuthScore = results.forensicAuthenticityScore ?? Math.max(0, 100 - forensicScore);
  const manipProb = results.manipulationProbability ?? results.forgeryRiskScore;
  const authProb = results.authenticityProbability ?? Math.max(0, 100 - manipProb);
  const certVal = results.predictionCertainty ?? results.confidence;

  const isAuth = results.verdict === "authenticated" || results.verdict === "authentic" || results.verdictLabel === "Authentic";
  const isInconc = results.verdict === "inconclusive" || results.verdict === "suspicious" || results.verdictLabel === "Inconclusive";

  // Radial score gauge calculation based on Forensic Manipulation Score
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (Math.min(100, Math.max(0, forensicScore)) / 100) * circumference;

  const gaugeColor = forensicScore >= 60 ? "text-red-500" : forensicScore >= 40 ? "text-amber-500" : "text-emerald-500";
  const gaugeTrack = forensicScore >= 60 ? "text-red-100" : forensicScore >= 40 ? "text-amber-100" : "text-emerald-100";

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

        {/* Action Buttons: [ View Report ] [ Download Report ] [ Share ] */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleViewReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-gray-600" />
            <span>View Report</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadClick}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-60 text-gray-700 text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer disabled:cursor-not-allowed"
          >
            <Download className={`w-3.5 h-3.5 text-gray-600 ${isGeneratingPdf ? "animate-pulse" : ""}`} />
            <span>{isGeneratingPdf ? "Generating PDF..." : "Download Report"}</span>
          </button>

          <button
            type="button"
            onClick={handleShareClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
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

      {/* Main 2-Column Results Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual Comparison Slider & Analyze Another Action */}
        <div className="lg:col-span-6 space-y-3.5">
          <ImageComparisonSlider
            originalImage={results.originalImageUrl}
            heatmapImage={results.localizationMapUrl}
          />

          {onAnalyzeAnother && (
            <div className="pt-4 flex justify-center items-center">
              <button
                type="button"
                onClick={onAnalyzeAnother}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-900 transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-gray-500" />
                <span>Analyze Another Image</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Verdict, Forgery Risk, Evidence Breakdown & AI Explanation */}
        <div className="lg:col-span-6 space-y-3.5">
          {/* Top Row: Verdict + Forensic Manipulation Score Gauge */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100">
            {/* Verdict */}
            <div className="sm:col-span-7 flex flex-col justify-center space-y-1 sm:pr-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Verdict
              </span>
              <div
                className={`flex items-center gap-2 ${
                  isAuth
                    ? "text-[#16a34a]"
                    : isInconc
                    ? "text-[#2563eb]"
                    : "text-[#dc2626]"
                }`}
              >
                {isAuth ? (
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

            {/* Forensic Manipulation Score Circular Radial Meter */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center pt-2 sm:pt-0 sm:pl-3 sm:border-l sm:border-gray-200/60">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1 whitespace-nowrap text-center">
                Forensic Manipulation Score
              </span>
              <div className="relative w-18 h-18 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  {/* Background Track */}
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    className={`${gaugeTrack} stroke-current`}
                    strokeWidth="6"
                    fill="transparent"
                  />
                  {/* Progress Arc */}
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    className={`${gaugeColor} stroke-current transition-all duration-1000 ease-out`}
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-base font-black text-gray-900 tracking-tight">
                    {forensicScore.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ML Metrics Row: Prediction Certainty + Authenticity + Detected Forged Area + Speed */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-blue-50/50 border border-blue-100/80">
            <div className="flex flex-col items-center gap-0.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Certainty</span>
              <span className="text-base sm:text-lg font-black text-[#1a7fc4]">{certVal}%</span>
              <span className="text-[10px] text-gray-500">Model certainty</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 text-center sm:border-l sm:border-blue-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Authenticity</span>
              <span className={`text-base sm:text-lg font-black ${forensicAuthScore >= 60 ? "text-emerald-600" : forensicAuthScore >= 40 ? "text-amber-500" : "text-red-500"}`}>
                {forensicAuthScore.toFixed(1)}%
              </span>
              <span className="text-[10px] text-gray-500">Forensic Authenticity Score</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 text-center sm:border-l sm:border-blue-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {isAuth || isInconc ? "Anomaly Area" : "Forged Area (Est.)"}
              </span>
              <span className="text-base sm:text-lg font-black text-orange-500">
                {typeof results.forgeryPixelFraction === "number" ? results.forgeryPixelFraction.toFixed(1) : results.forgeryPixelFraction}%
              </span>
              <span className="text-[10px] text-gray-500">
                {isAuth || isInconc ? "Localized anomaly" : "Detected pixels"}
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5 text-center sm:border-l sm:border-blue-100">
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

      {/* Feedback Section — Large rounded horizontal card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-gray-900">Was this analysis useful?</h4>
            <p className="text-[11px] sm:text-xs text-gray-500">Your feedback helps us improve our system.</p>
          </div>
          {feedbackSubmitted && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Thanks for your feedback!
            </span>
          )}
        </div>

        {!feedbackSubmitted ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Useful & Not Useful Buttons on the Left */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setFeedbackRating("useful")}
                className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  feedbackRating === "useful"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${feedbackRating === "useful" ? "text-emerald-600" : "text-gray-500"}`} />
                <span>Useful</span>
              </button>

              <button
                type="button"
                onClick={() => setFeedbackRating("not_useful")}
                className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  feedbackRating === "not_useful"
                    ? "bg-red-50 border-red-300 text-red-700 shadow-xs"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ThumbsDown className={`w-3.5 h-3.5 ${feedbackRating === "not_useful" ? "text-red-600" : "text-gray-500"}`} />
                <span>Not Useful</span>
              </button>
            </div>

            {/* Wider Text Input Field */}
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Tell us your feedback (optional)..."
                maxLength={1000}
                className="w-full px-4 py-2 text-xs rounded-xl border border-gray-200 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
              />
            </div>

            {/* Submit Button placed CLOSE right beside input */}
            <button
              type="button"
              disabled={!feedbackRating || isSubmittingFeedback}
              onClick={handleFeedbackSubmit}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs shrink-0 cursor-pointer"
            >
              {isSubmittingFeedback ? "Submitting..." : "Submit"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
