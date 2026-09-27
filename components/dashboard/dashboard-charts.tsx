"use client";

import { useState } from "react";
import { PieChart, Activity } from "lucide-react";
import type { ActivityDataPoint, ActivityTimelines } from "@/lib/history";
import type { HistorySummaryStats } from "@/components/history/types";

interface DashboardChartsProps {
  stats: HistorySummaryStats;
  activityTimeline?: ActivityDataPoint[];
  timelines?: ActivityTimelines;
}

export function DashboardCharts({
  stats,
  activityTimeline = [],
  timelines,
}: DashboardChartsProps) {
  // -------------------------------------------------------------
  // 1. Forensic Overview Data
  // -------------------------------------------------------------
  const total = stats.completedCount > 0 ? stats.completedCount : stats.totalAnalyses;
  const authenticated = stats.authenticatedCount ?? 0;
  const manipulated = stats.manipulatedCount ?? stats.potentiallyForgedCount ?? 0;
  const inconclusive =
    stats.inconclusiveCount ??
    (total >= authenticated + manipulated ? total - authenticated - manipulated : 0);

  const authPct = total > 0 ? Math.round((authenticated / total) * 100) : 0;
  const manipPct = total > 0 ? Math.round((manipulated / total) * 100) : 0;
  const inconclusivePct = total > 0 ? Math.round((inconclusive / total) * 100) : 0;

  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [selectedRange, setSelectedRange] = useState<"7d" | "30d" | "all">("7d");

  // Donut geometry
  const radius = 58;
  const circumference = 2 * Math.PI * radius; // ~364.42

  const categories = [
    {
      id: "manipulated",
      label: "Manipulated",
      count: manipulated,
      pct: manipPct,
      color: "#f43f5e", // Rose/Red
      dotClass: "bg-rose-500",
      textClass: "text-rose-600",
      bgSubtle: "bg-rose-50/80 border-rose-100/70",
    },
    {
      id: "authenticated",
      label: "Authentic",
      count: authenticated,
      pct: authPct,
      color: "#10b981", // Emerald/Green
      dotClass: "bg-emerald-500",
      textClass: "text-emerald-600",
      bgSubtle: "bg-emerald-50/80 border-emerald-100/70",
    },
    {
      id: "inconclusive",
      label: "Inconclusive",
      count: inconclusive,
      pct: inconclusivePct,
      color: "#0ea5e9", // Sky/Blue
      dotClass: "bg-sky-500",
      textClass: "text-sky-600",
      bgSubtle: "bg-sky-50/80 border-sky-100/70",
    },
  ];

  // Calculate SVG stroke offsets
  let accumulatedFraction = 0;
  const donutSegments = categories.map((cat) => {
    const fraction = total > 0 ? cat.count / total : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedFraction * circumference;
    accumulatedFraction += fraction;
    return {
      ...cat,
      fraction,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeCategory = hoveredSegment
    ? categories.find((c) => c.id === hoveredSegment)
    : null;

  // -------------------------------------------------------------
  // 2. Analysis Activity Chart
  // -------------------------------------------------------------
  const points: ActivityDataPoint[] = (() => {
    if (timelines) {
      if (selectedRange === "7d") return timelines.last7Days;
      if (selectedRange === "30d") return timelines.last30Days;
      if (selectedRange === "all") return timelines.allTime;
    }
    return activityTimeline;
  })();

  const maxCount = Math.max(1, ...points.map((p) => p.count));

  const svgWidth = 460;
  const svgHeight = 170;
  const padLeft = 32;
  const padRight = 20;
  const padTop = 24;
  const padBottom = 30;

  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;
  const nPoints = points.length;

  const coords = points.map((p, i) => {
    const x = padLeft + (nPoints > 1 ? (i / (nPoints - 1)) * plotWidth : plotWidth / 2);
    const y = padTop + (1 - p.count / maxCount) * plotHeight;
    return { x, y, data: p };
  });

  const activePoint =
    hoveredPointIndex !== null && coords[hoveredPointIndex]
      ? coords[hoveredPointIndex]
      : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
      {/* -------------------------------------------------------- */}
      {/* LEFT: Forensic Overview Donut Chart                      */}
      {/* -------------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] border border-blue-100/80 dark:border-blue-900/50 flex items-center justify-center shadow-2xs">
              <PieChart className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Forensic Overview
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Breakdown of canonical verdict distributions
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
            {total} {total === 1 ? "Analysis" : "Analyses"}
          </span>
        </div>

        {/* Chart & Center stats */}
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-5 my-auto">
          {/* Donut graphic */}
          <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 160 160"
            >
              {/* Background ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="18"
                fill="none"
              />

              {/* Segments */}
              {total > 0 &&
                donutSegments.map((seg) => {
                  if (seg.count === 0) return null;
                  const isHovered = hoveredSegment === seg.id;
                  return (
                    <circle
                      key={seg.id}
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke={seg.color}
                      strokeWidth={isHovered ? "22" : "18"}
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeDashoffset}
                      fill="none"
                      strokeLinecap="round"
                      className="cursor-pointer transition-all duration-200 ease-in-out"
                      onMouseEnter={() => setHoveredSegment(seg.id)}
                      onMouseLeave={() => setHoveredSegment(null)}
                      style={{
                        filter: isHovered
                          ? `drop-shadow(0 2px 6px ${seg.color}66)`
                          : "none",
                      }}
                    />
                  );
                })}
            </svg>

            {/* Center Dynamic Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-2">
              {activeCategory ? (
                <div className="animate-fade-in">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${activeCategory.textClass}`}
                  >
                    {activeCategory.label}
                  </span>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
                    {activeCategory.count}
                  </p>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {activeCategory.pct}% of total
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Total Scans
                  </span>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
                    {total}
                  </p>
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    {total > 0 ? "100% verified" : "No scans yet"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Legend List */}
          <div className="w-full sm:w-auto flex flex-col gap-2.5 min-w-[170px]">
            {categories.map((cat) => {
              const isHovered = hoveredSegment === cat.id;
              return (
                <div
                  key={cat.id}
                  onMouseEnter={() => setHoveredSegment(cat.id)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  className={`flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                    isHovered
                      ? `${cat.bgSubtle} shadow-xs -translate-y-0.5`
                      : "bg-slate-50/60 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${cat.dotClass}`} />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {cat.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {cat.count}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                      ({cat.pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------- */}
      {/* RIGHT: Analysis Activity Chart                           */}
      {/* -------------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all">
        {/* Header with Segmented Time Range Options */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100/80 dark:border-emerald-900/50 flex items-center justify-center shadow-2xs">
              <Activity className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Analysis Activity
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Analysis throughput over time
              </p>
            </div>
          </div>

          {/* Segmented Options */}
          <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setSelectedRange("7d");
                setHoveredPointIndex(null);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                selectedRange === "7d"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-2xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Last 7 days
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRange("30d");
                setHoveredPointIndex(null);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                selectedRange === "30d"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-2xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Last 30 days
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRange("all");
                setHoveredPointIndex(null);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                selectedRange === "all"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-2xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All time
            </button>
          </div>
        </div>

        {/* SVG Vertical Rectangular Bar Chart */}
        <div className="relative w-full my-auto pt-3">
          {/* Active Tooltip Pill */}
          <div className="h-6 flex items-center justify-end px-1">
            {activePoint ? (
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 px-2.5 py-0.5 rounded-md shadow-2xs animate-fade-in font-mono">
                <span className="text-slate-500 dark:text-slate-400 font-normal">
                  {activePoint.data.fullDate}:
                </span>
                <span className="font-bold text-[#1a7fc4] dark:text-[#5bb8f5]">
                  {activePoint.data.count}{" "}
                  {activePoint.data.count === 1 ? "analysis" : "analyses"}
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Hover over any bar to inspect volume
              </span>
            )}
          </div>

          <svg
            className="w-full h-44 overflow-visible select-none"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
          >
            {/* Horizontal Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = padTop + ratio * plotHeight;
              const value = Math.round(maxCount * (1 - ratio));
              return (
                <g key={idx}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={svgWidth - padRight}
                    y2={y}
                    stroke="#f1f5f9"
                    className="stroke-[#f1f5f9] dark:stroke-slate-800"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padLeft - 6}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[9px] fill-slate-400 dark:fill-slate-500 font-mono select-none"
                  >
                    {value}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {coords.map((c, i) => {
              const barWidth = Math.max(
                4,
                Math.min(18, (plotWidth / Math.max(1, coords.length)) * 0.55)
              );
              const barHeight = Math.max(
                c.data.count > 0 ? 4 : 0,
                padTop + plotHeight - c.y
              );
              const barX = c.x - barWidth / 2;
              const barY = padTop + plotHeight - barHeight;
              const isHovered = hoveredPointIndex === i;

              return (
                <g key={i}>
                  {/* Invisible Hover target */}
                  <rect
                    x={c.x - (plotWidth / Math.max(1, coords.length)) / 2}
                    y={padTop}
                    width={plotWidth / Math.max(1, coords.length)}
                    height={plotHeight + padBottom}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPointIndex(i)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                  />

                  {/* Visible Bar */}
                  <rect
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    rx={barWidth / 3}
                    className={`transition-all duration-200 pointer-events-none ${
                      isHovered
                        ? "fill-[#1a7fc4] dark:fill-[#5bb8f5]"
                        : c.data.count > 0
                        ? "fill-[#3b82f6]/80 dark:fill-[#3b82f6]/90"
                        : "fill-slate-100 dark:fill-slate-800"
                    }`}
                  />

                  {/* X-axis Label */}
                  {(selectedRange === "7d" ||
                    (selectedRange === "30d" && i % 5 === 0) ||
                    (selectedRange === "all" && i % Math.max(1, Math.floor(coords.length / 6)) === 0)) && (
                    <text
                      x={c.x}
                      y={svgHeight - 8}
                      textAnchor="middle"
                      className={`text-[9px] select-none transition-colors ${
                        isHovered
                          ? "fill-[#1a7fc4] dark:fill-[#5bb8f5] font-bold"
                          : "fill-slate-400 dark:fill-slate-500 font-medium"
                      }`}
                    >
                      {c.data.date}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
