"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Search,
  ChevronDown,
  History as HistoryIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { TopNavBar } from "@/components/analyze/top-nav-bar";
import { AnalysisHistoryCard } from "./analysis-history-card";
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

  // Filter and sort the real records
  const filteredAnalyses = useMemo(() => {
    return analyses
      .filter((item) => {
        // Search match
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
          verdictFilter === "Likely Manipulated" ||
          verdictFilter === "Potentially Forged"
        ) {
          if (item.verdict !== "forged" && item.verdictLabel !== "Likely Manipulated" && item.verdictLabel !== "Potentially Forged") return false;
        }
        if (
          verdictFilter === "Appears Authentic" ||
          verdictFilter === "Likely Authentic"
        ) {
          if (item.verdict !== "authentic" && item.verdictLabel !== "Appears Authentic" && item.verdictLabel !== "Likely Authentic") return false;
        }
        if (verdictFilter === "Inconclusive") {
          if (item.verdict !== "inconclusive" && item.verdictLabel !== "Inconclusive") return false;
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
        if (sortBy === "Highest Risk") {
          return b.riskScore - a.riskScore;
        }
        if (sortBy === "Lowest Risk") {
          return a.riskScore - b.riskScore;
        }
        return 0;
      });
  }, [analyses, searchQuery, statusFilter, verdictFilter, sortBy]);

  // Pagination calculation
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

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("Completed");
    setVerdictFilter("All Verdicts");
    setSortBy("Newest First");
    setCurrentPage(1);
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

      {/* Main Heading Row & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Analysis History
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            View and manage your previous image-forensics analyses, evidence and reports.
          </p>
        </div>

        <div>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a7fc4] hover:bg-[#1565a8] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Start New Analysis</span>
          </Link>
        </div>
      </div>

      {/* Summary Stats Cards */}
      {!loading && !error && analyses.length > 0 && (
        <HistorySummaryCards stats={stats} />
      )}

      {/* Search, Filter & Sort Controls */}
      <div className="bg-transparent flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-1">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by filename or analysis ID..."
            className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-white hover:border-gray-300 focus:bg-white border border-gray-200/80 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a7fc4]/20 focus:border-[#1a7fc4] transition-all shadow-2xs"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Status filter */}
          <div className="relative shrink-0">
            <div className="text-[10px] uppercase font-semibold text-gray-400 absolute left-3 top-1 pointer-events-none">
              Status
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-white border border-gray-200/80 rounded-xl pl-3 pr-8 pt-4 pb-1 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a7fc4]/20 focus:border-[#1a7fc4] transition-all shadow-2xs cursor-pointer min-w-[110px]"
            >
              <option value="Completed">Completed</option>
              <option value="All Status">All Status</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Verdicts filter */}
          <div className="relative shrink-0">
            <div className="text-[10px] uppercase font-semibold text-gray-400 absolute left-3 top-1 pointer-events-none">
              Verdict
            </div>
            <select
              value={verdictFilter}
              onChange={(e) => {
                setVerdictFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-white border border-gray-200/80 rounded-xl pl-3 pr-8 pt-4 pb-1 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a7fc4]/20 focus:border-[#1a7fc4] transition-all shadow-2xs cursor-pointer min-w-[145px]"
            >
              <option value="All Verdicts">All Verdicts</option>
              <option value="Likely Manipulated">Likely Manipulated</option>
              <option value="Appears Authentic">Appears Authentic</option>
              <option value="Inconclusive">Inconclusive</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort By filter */}
          <div className="relative shrink-0">
            <div className="text-[10px] uppercase font-semibold text-gray-400 absolute left-3 top-1 pointer-events-none">
              Sort By
            </div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-white border border-gray-200/80 rounded-xl pl-3 pr-8 pt-4 pb-1 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a7fc4]/20 focus:border-[#1a7fc4] transition-all shadow-2xs cursor-pointer min-w-[130px]"
            >
              <option value="Newest First">Newest First</option>
              <option value="Oldest First">Oldest First</option>
              <option value="Highest Risk">Highest Risk</option>
              <option value="Lowest Risk">Lowest Risk</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-xs flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#1a7fc4]" />
          <p className="text-sm font-semibold text-gray-700">Loading analysis history...</p>
          <p className="text-xs text-gray-400">Fetching records from database</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-3xl border border-red-100 p-8 text-center shadow-xs space-y-3 max-w-md mx-auto">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">Unable to load history</h3>
          <p className="text-xs text-red-600">{error}</p>
          <button
            type="button"
            onClick={fetchHistory}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : (
        /* Analysis Cards List */
        <div className="space-y-3 sm:space-y-4">
          {totalItems > 0 ? (
            paginatedAnalyses.map((analysis) => (
              <AnalysisHistoryCard key={analysis.id} analysis={analysis} />
            ))
          ) : (
            /* Empty state for 0 results or filtered empty */
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4 border border-purple-100/60">
                <HistoryIcon className="w-7 h-7 stroke-[1.75]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {searchQuery || verdictFilter !== "All Verdicts" || statusFilter !== "Completed"
                  ? "No matching analyses found"
                  : "No Past Analyses"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                {searchQuery || verdictFilter !== "All Verdicts" || statusFilter !== "Completed"
                  ? "Try adjusting your search query or filter options to find previous forensic records."
                  : "You haven't run any image forensics yet. Upload your first image to generate forensic evidence."}
              </p>
              {searchQuery || verdictFilter !== "All Verdicts" || statusFilter !== "Completed" ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-2xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              ) : (
                <Link
                  href="/analyze"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a7fc4] text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-[#1565a8] transition-colors shadow-xs cursor-pointer"
                >
                  <span>Start First Analysis</span>
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom Pagination & Count */}
      {!loading && !error && totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 pb-4">
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Showing <span className="font-semibold text-gray-900">{startRecord}–{endRecord}</span> of{" "}
            <span className="font-semibold text-gray-900">{totalItems}</span> analyses
          </p>

          <div className="flex items-center gap-1.5">
            {/* Previous button */}
            <button
              type="button"
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
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
                      ? "bg-[#1a7fc4] text-white shadow-xs"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-2xs"
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
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
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
