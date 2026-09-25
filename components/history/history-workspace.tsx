"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Search,
  ChevronDown,
  History as HistoryIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
  LayoutGrid,
  List,
  Filter,
  ArrowUpDown,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/components/motion-utils";
import { TopNavBar } from "@/components/analyze/top-nav-bar";
import { AnalysisHistoryCard } from "./analysis-history-card";
import { AnalysisHistoryTable } from "./analysis-history-table";
import { HistorySummaryCards } from "./history-summary-cards";
import type { CompletedAnalysisRecord, HistorySummaryStats } from "./types";

interface HistoryWorkspaceProps {
  userInitial?: string;
  userDisplayName?: string;
}

const ITEMS_PER_PAGE = 5;

export function HistoryWorkspace({
  userInitial = "P",
  userDisplayName = "Pulkit Sinha",
}: HistoryWorkspaceProps) {
  const shouldReduceMotion = useReducedMotion();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [analyses, setAnalyses] = useState<CompletedAnalysisRecord[]>([]);
  const [stats, setStats] = useState<HistorySummaryStats>({
    totalAnalyses: 0,
    completedCount: 0,
    authenticatedCount: 0,
    manipulatedCount: 0,
    inconclusiveCount: 0,
    potentiallyForgedCount: 0,
    averageRiskPercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Completed");
  const [verdictFilter, setVerdictFilter] = useState("All Verdicts");
  const [sortBy, setSortBy] = useState("Newest First");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Fetch real analysis records from the authenticated /api/history endpoint
  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/history");
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = `/sign-in?redirect_url=${encodeURIComponent(window.location.href)}`;
          return;
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to load analysis history.");
      }

      const data = await res.json();
      setAnalyses(data.records || []);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
      setError(err instanceof Error ? err.message : "Failed to load history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Global keyboard shortcut to focus search with '/' or 'Cmd+K' / 'Ctrl+K'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter and sort the real records
  const filteredAnalyses = useMemo(() => {
    return analyses
      .filter((item) => {
        // Search match across filename or analysis ID
        const query = searchQuery.trim().toLowerCase();
        if (query) {
          const matchesName = item.filename.toLowerCase().includes(query);
          const matchesId = item.id.toLowerCase().includes(query);
          if (!matchesName && !matchesId) return false;
        }

        // Status filter
        if (statusFilter === "Completed" && item.status && item.status !== "completed") {
          return false;
        }

        // Verdict filter
        if (
          verdictFilter === "Manipulated" ||
          verdictFilter === "Likely Manipulated" ||
          verdictFilter === "Potentially Forged"
        ) {
          if (
            item.verdict !== "forged" &&
            item.verdictLabel !== "Manipulated" &&
            item.verdictLabel !== "Likely Manipulated" &&
            item.verdictLabel !== "Potentially Forged"
          )
            return false;
        }
        if (
          verdictFilter === "Authentic" ||
          verdictFilter === "Authenticated" ||
          verdictFilter === "Appears Authentic" ||
          verdictFilter === "Likely Authentic"
        ) {
          if (
            item.verdict !== "authentic" &&
            item.verdictLabel !== "Authentic" &&
            item.verdictLabel !== "Authenticated" &&
            item.verdictLabel !== "Appears Authentic" &&
            item.verdictLabel !== "Likely Authentic"
          )
            return false;
        }
        if (verdictFilter === "Inconclusive") {
          if (item.verdict !== "inconclusive" && item.verdictLabel !== "Inconclusive")
            return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "Newest First") {
          return b.analyzedTimestamp - a.analyzedTimestamp;
        }
        if (sortBy === "Oldest First") {
          return a.analyzedTimestamp - b.analyzedTimestamp;
        }
        if (
          sortBy === "Highest Probability" ||
          sortBy === "Highest Risk" ||
          sortBy === "Highest Score"
        ) {
          return b.riskScore - a.riskScore;
        }
        if (
          sortBy === "Lowest Probability" ||
          sortBy === "Lowest Risk" ||
          sortBy === "Lowest Score"
        ) {
          return a.riskScore - b.riskScore;
        }
        return 0;
      });
  }, [analyses, searchQuery, statusFilter, verdictFilter, sortBy]);

  // Pagination calculations
  const totalItems = filteredAnalyses.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedAnalyses = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredAnalyses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAnalyses, safeCurrentPage]);

  const startRecord = totalItems === 0 ? 0 : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;
  const endRecord = Math.min(safeCurrentPage * ITEMS_PER_PAGE, totalItems);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const isFiltered =
    searchQuery !== "" ||
    statusFilter !== "Completed" ||
    verdictFilter !== "All Verdicts" ||
    sortBy !== "Newest First";

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("Completed");
    setVerdictFilter("All Verdicts");
    setSortBy("Newest First");
    setCurrentPage(1);
  };

  const headerVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : -8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0.1 : 0.45, ease: EASE_OUT },
    },
  };

  const listContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.05,
        delayChildren: shouldReduceMotion ? 0 : 0.02,
      },
    },
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Utility Nav Bar with Back Link and Profile */}
      <TopNavBar
        userInitial={userInitial}
        userDisplayName={userDisplayName}
        backHref="/dashboard"
        backLabel="Back to Dashboard"
      />

      {/* Editorial Header Row & Action CTA */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-1"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Analysis History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            Review, search and export your historical multi-evidence forensic investigations.
          </p>
        </div>

        <div>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-[#1a7fc4] hover:bg-[#1565a8] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Start New Analysis</span>
          </Link>
        </div>
      </motion.div>

      {/* Interactive Summary KPI Cards */}
      {!loading && !error && analyses.length > 0 && (
        <HistorySummaryCards
          stats={stats}
          selectedVerdictFilter={verdictFilter}
          onSelectVerdictFilter={(selected) => {
            setVerdictFilter(selected);
            setCurrentPage(1);
          }}
        />
      )}

      {/* Search, Filter & View Mode Command Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 sm:p-2.5 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        {/* Search Input Field */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by filename or analysis ID... (Press ⌘K)"
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a7fc4]/20 focus:border-[#1a7fc4] transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Group & View Mode Switcher */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between md:justify-end">
          {/* Status filter */}
          <div className="relative shrink-0">
            <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400 absolute left-3 top-1 pointer-events-none">
              Status
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl pl-3 pr-8 pt-4 pb-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a7fc4]/20 focus:border-[#1a7fc4] transition-all shadow-2xs cursor-pointer min-w-[105px]"
            >
              <option value="Completed">Completed</option>
              <option value="All Status">All Status</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Verdicts filter */}
          <div className="relative shrink-0">
            <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400 absolute left-3 top-1 pointer-events-none">
              Verdict
            </div>
            <select
              value={verdictFilter}
              onChange={(e) => {
                setVerdictFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl pl-3 pr-8 pt-4 pb-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a7fc4]/20 focus:border-[#1a7fc4] transition-all shadow-2xs cursor-pointer min-w-[135px]"
            >
              <option value="All Verdicts">All Verdicts</option>
              <option value="Manipulated">Manipulated</option>
              <option value="Authentic">Authentic</option>
              <option value="Inconclusive">Inconclusive</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort By filter */}
          <div className="relative shrink-0">
            <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400 absolute left-3 top-1 pointer-events-none">
              Sort By
            </div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl pl-3 pr-8 pt-4 pb-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a7fc4]/20 focus:border-[#1a7fc4] transition-all shadow-2xs cursor-pointer min-w-[145px]"
            >
              <option value="Newest First">Newest First</option>
              <option value="Oldest First">Oldest First</option>
              <option value="Highest Probability">Highest Score</option>
              <option value="Lowest Probability">Lowest Score</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Reset Filters Shortcut */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              title="Reset all filters"
              className="px-2.5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer shrink-0 flex items-center gap-1 text-xs font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          {/* View Mode Toggle Button Group */}
          <div className="hidden sm:flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200/80 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              title="Detailed Cards View"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "cards"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              title="Compact Table View"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        /* Refined SaaS Loading Shimmer */
        <div className="space-y-3 sm:space-y-3.5">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-slate-200/70 p-4 sm:p-5 shadow-2xs animate-pulse flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-24 h-16 sm:w-28 sm:h-18 rounded-xl bg-slate-100 shrink-0" />
                <div className="space-y-2 flex-1 max-w-sm">
                  <div className="h-4 bg-slate-200/80 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                  <div className="h-3 bg-slate-100 rounded-md w-1/3" />
                </div>
              </div>
              <div className="flex items-center gap-6 justify-between md:justify-end">
                <div className="space-y-1.5 w-24">
                  <div className="h-5 bg-slate-100 rounded-full w-20" />
                  <div className="h-6 bg-slate-200/80 rounded-md w-16" />
                </div>
                <div className="w-28 h-9 bg-slate-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div className="bg-white rounded-2xl border border-red-200 p-8 sm:p-10 text-center shadow-xs space-y-3 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
            <HistoryIcon className="w-6 h-6 stroke-[1.75]" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Unable to load history</h3>
          <p className="text-xs text-red-600 leading-relaxed">{error}</p>
          <button
            type="button"
            onClick={fetchHistory}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : (
        /* Analysis Records Display (Cards View or Table View) */
        <AnimatePresence mode="wait">
          {totalItems > 0 ? (
            viewMode === "cards" ? (
              <motion.div
                key="cards-view"
                variants={listContainerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className="space-y-3 sm:space-y-3.5"
              >
                {paginatedAnalyses.map((analysis) => (
                  <AnalysisHistoryCard key={analysis.id} analysis={analysis} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="table-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <AnalysisHistoryTable analyses={paginatedAnalyses} />
              </motion.div>
            )
          ) : (
            /* Refined SaaS Empty State */
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200/80 p-10 sm:p-14 text-center shadow-2xs"
            >
              <div className="w-13 h-13 rounded-2xl bg-blue-50 text-[#1a7fc4] flex items-center justify-center mx-auto mb-4 border border-blue-100/80">
                <HistoryIcon className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                {isFiltered ? "No matching analyses found" : "No Past Analyses"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">
                {isFiltered
                  ? "Try adjusting your search terms or filter criteria to discover previous forensic records."
                  : "You have not performed any image forensic analyses yet. Analyze your first image to begin generating evidence records."}
              </p>
              {isFiltered ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-2xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              ) : (
                <Link
                  href="/analyze"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a7fc4] text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-[#1565a8] transition-all shadow-xs cursor-pointer hover:shadow"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Start First Analysis</span>
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Bottom Pagination & Count Bar */}
      {!loading && !error && totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 pt-2 pb-4 border-t border-slate-200/60">
          <p className="text-xs text-slate-500 font-medium">
            Showing <span className="font-semibold text-slate-900">{startRecord}–{endRecord}</span> of{" "}
            <span className="font-semibold text-slate-900">{totalItems}</span> analyses
          </p>

          <div className="flex items-center gap-1.5">
            {/* Previous button */}
            <button
              type="button"
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {/* Page number buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const isActive = page === safeCurrentPage;
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#1a7fc4] text-white shadow-xs font-bold"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            {/* Next button */}
            <button
              type="button"
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
