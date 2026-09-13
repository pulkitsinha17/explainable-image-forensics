"use client";

import { CheckCircle2, Loader2 } from "lucide-react";

interface AnalysisProgressProps {
  progress: number; // 0 to 100
  currentStage: "uploading" | "analyzing" | "generating" | "finishing";
  /** Override the main heading (defaults to "Analyzing your image...") */
  label?: string;
  /** Override the subtitle copy */
  subtitle?: string;
}

export function AnalysisProgress({
  progress,
  currentStage,
  label = "Analyzing your image...",
  subtitle = "This may take a few moments. Please don't close the page.",
}: AnalysisProgressProps) {
  const stages = [
    { id: "uploading", label: "Uploading" },
    { id: "analyzing", label: "Analyzing" },
    { id: "generating", label: "Generating results" },
    { id: "finishing", label: "Almost done" },
  ];

  const stageOrder = ["uploading", "analyzing", "generating", "finishing"];
  const currentIdx = stageOrder.indexOf(currentStage);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-10 text-center animate-fade-in">
      {/* Centered Circular Spinner */}
      <div className="flex justify-center mb-4">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#1a7fc4] animate-spin stroke-[2.5]" />
        </div>
      </div>

      {/* Heading & Subtitle */}
      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
        {label}
      </h3>
      <p className="text-xs sm:text-sm text-gray-500 mb-6">
        {subtitle}
      </p>

      {/* Progress Bar & Percentage */}
      <div className="max-w-xl mx-auto mb-7">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#1a7fc4] h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(Math.max(progress, 5), 100)}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-700 min-w-[36px] text-right">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* 4-Stage Stepper */}
      <div className="max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
        {stages.map((stage, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div
              key={stage.id}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                isCurrent
                  ? "bg-blue-50/70 text-[#1a7fc4] font-semibold"
                  : isDone
                  ? "text-gray-700"
                  : "text-gray-400"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 fill-emerald-50" />
              ) : isCurrent ? (
                <span className="relative flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1a7fc4] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1a7fc4]" />
                </span>
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 shrink-0" />
              )}
              <span className="truncate">{stage.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
