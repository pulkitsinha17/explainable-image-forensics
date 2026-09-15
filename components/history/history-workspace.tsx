"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  PlusCircle,
  Search,
  ChevronDown,
  History as HistoryIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { TopNavBar } from "@/components/analyze/top-nav-bar";
import { AnalysisHistoryCard } from "./analysis-history-card";
import type { CompletedAnalysisRecord } from "./types";

interface HistoryWorkspaceProps {
  userInitial?: string;
  userDisplayName?: string;
}

// 12 Realistic COMPLETED forensic analysis demo records
const DEMO_COMPLETED_ANALYSES: CompletedAnalysisRecord[] = [
  {
    id: "anlz_01j8m49a71b3k9q0vw1",
    filename: "wallpaper_new.jpg",
    format: "JPEG",
    dimensions: "5120 × 2880",
    fileSizeFormatted: "121.6 KB",
    analyzedAt: "Sep 14, 2026 at 10:24 AM",
    analyzedTimestamp: new Date("2026-09-14T10:24:00").getTime(),
    verdict: "forged",
    verdictLabel: "Potentially Forged",
    riskScore: 78,
    thumbnailUrl: "/images/mountain.png",
  },
  {
    id: "anlz_01j8m49a71b3k9q0vw2",
    filename: "city_view.png",
    format: "PNG",
    dimensions: "1920 × 1080",
    fileSizeFormatted: "2.4 MB",
    analyzedAt: "Sep 12, 2026 at 03:18 PM",
    analyzedTimestamp: new Date("2026-09-12T15:18:00").getTime(),
    verdict: "authentic",
    verdictLabel: "Likely Authentic",
    riskScore: 14,
    thumbnailUrl: "/images/campus.png",
  },
  {
    id: "anlz_01j8m49a71b3k9q0vw3",
    filename: "mountains.jpg",
    format: "JPEG",
    dimensions: "3840 × 2160",
    fileSizeFormatted: "3.1 MB",
    analyzedAt: "Sep 10, 2026 at 11:02 AM",
    analyzedTimestamp: new Date("2026-09-10T11:02:00").getTime(),
    verdict: "inconclusive",
    verdictLabel: "Inconclusive",
    riskScore: 38,
    thumbnailUrl: "/images/mountain.png",
  },
  {
    id: "anlz_01j8m49a71b3k9q0vw4",
    filename: "forest.png",
    format: "PNG",
    dimensions: "2560 × 1440",
    fileSizeFormatted: "1.9 MB",
    analyzedAt: "Sep 9, 2026 at 09:41 AM",
    analyzedTimestamp: new Date("2026-09-09T09:41:00").getTime(),
    verdict: "forged",
    verdictLabel: "Potentially Forged",
    riskScore: 67,
    thumbnailUrl: "/images/castle.png",
  },
  {
    id: "anlz_01j8m49a71b3k9q0vw5",
    filename: "beach.jpg",
    format: "JPEG",
    dimensions: "4032 × 3024",
    fileSizeFormatted: "2.8 MB",
    analyzedAt: "Sep 8, 2026 at 02:15 PM",
    analyzedTimestamp: new Date("2026-09-08T14:15:00").getTime(),
    verdict: "authentic",
    verdictLabel: "Likely Authentic",
    riskScore: 12,
    thumbnailUrl: "/images/campus.png",
  },
  {
    id: "anlz_01j8m49a71b3k9q0vw6",
    filename: "portrait_headshot.png",
    format: "PNG",
    dimensions: "2048 × 2048",
    fileSizeFormatted: "3.4 MB",
    analyzedAt: "Sep 6, 2026 at 04:30 PM",
    analyzedTimestamp: new Date("2026-09-06T16:30:00").getTime(),
    verdict: "forged",
    verdictLabel: "Potentially Forged",
    riskScore: 82,
    thumbnailUrl: "/images/mountain.png",
  },
  {
    id: "anlz_01j8m49a71b3k9q0vw7",
    filename: "document_scan.jpg",
    format: "JPEG",
    dimensions: "2480 × 3508",
    fileSizeFormatted: "1.8 MB",
    analyzedAt: "Sep 5, 2026 at 01:10 PM",
    analyzedTimestamp: new Date("2026-09-05T13:10:00").getTime(),
    verdict: "authentic",
    verdictLabel: "Likely Authentic",
    riskScore: 8,
    thumbnailUrl: "/images/castle.png",
  },
  {
    id: "anlz_01j8m49a71b3k9q0vw8",
    filename: "satellite_urban.tiff",
    format: "TIFF",
    dimensions: "4096 × 4096",
    fileSizeFormatted: "8.5 MB",
    analyzedAt: "Sep 3, 2026 at 08:22 AM",
    analyzedTimestamp: new Date("2026-09-03T08:22:00").getTime(),
    verdict: "inconclusive",
    verdictLabel: "Inconclusive",
    riskScore: 41,
    thumbnailUrl: "/images/campus.png",
  },
  {
    id: "anlz_01j8m49a71b3k9q0vw9",
    filename: "car_accident_claim.jpg",
    format: "JPEG",
    dimensions: "3024 × 4032",
    fileSizeFormatted: "3.1 MB",
    analyzedAt: "Sep 2, 2026 at 05:45 PM",
    analyzedTimestamp: new Date("2026-09-02T17:45:00").getTime(),
    verdict: "forged",
    verdictLabel: "Potentially Forged",
    riskScore: 89,
    thumbnailUrl: "/images/mountain.png",
  },
  {
    id: "anlz_01j8m49a71b3k9q0vw10",
    filename: "nature_macro.png",
    format: "PNG",
    dimensions: "1920 × 1080",
    fileSizeFormatted: "2.1 MB",
    analyzedAt: "Aug 30, 2026 at 11:00 AM",
    analyzedTimestamp: new Date("2026-08-30T11:00:00").getTime(),
    verdict: "authentic",
    verdictLabel: "Likely Authentic",
    riskScore: 5,
    thumbnailUrl: "/images/castle.png",
  },
  {
    id: "anlz_01j8m49a71b3k9q0vw11",
    filename: "id_card_front.jpg",
    format: "JPEG",
    dimensions: "1600 × 1200",
    fileSizeFormatted: "980 KB",
    analyzedAt: "Aug 28, 2026 at 02:15 PM",
    analyzedTimestamp: new Date("2026-08-28T14:15:00").getTime(),
    verdict: "forged",
    verdictLabel: "Potentially Forged",
    riskScore: 73,
    thumbnailUrl: "/images/campus.png",
  },
  {
    id: "anlz_01j8m49a71b3k9q0vw12",
    filename: "architecture_night.jpg",
    format: "JPEG",
    dimensions: "3840 × 2160",
    fileSizeFormatted: "4.2 MB",
    analyzedAt: "Aug 25, 2026 at 09:00 PM",
    analyzedTimestamp: new Date("2026-08-25T21:00:00").getTime(),
    verdict: "inconclusive",
    verdictLabel: "Inconclusive",
    riskScore: 35,
    thumbnailUrl: "/images/mountain.png",
  },
];

const ITEMS_PER_PAGE = 5;

export function HistoryWorkspace({
  userInitial = "P",
  userDisplayName = "Pulkit Sinha",
}: HistoryWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Completed");
  const [verdictFilter, setVerdictFilter] = useState("All Verdicts");
  const [sortBy, setSortBy] = useState("Newest First");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort the completed records
  const filteredAnalyses = useMemo(() => {
    return DEMO_COMPLETED_ANALYSES.filter((item) => {
      // Search match
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const matchesName = item.filename.toLowerCase().includes(query);
        const matchesId = item.id.toLowerCase().includes(query);
        if (!matchesName && !matchesId) return false;
      }

      // Status filter
      if (statusFilter === "Completed") {
        // All items in list are completed
      }

      // Verdict filter
      if (verdictFilter === "Potentially Forged" && item.verdict !== "forged") {
        return false;
      }
      if (verdictFilter === "Likely Authentic" && item.verdict !== "authentic") {
        return false;
      }
      if (verdictFilter === "Inconclusive" && item.verdict !== "inconclusive") {
        return false;
      }

      return true;
    }).sort((a, b) => {
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
  }, [searchQuery, statusFilter, verdictFilter, sortBy]);

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
    <div className="space-y-5 sm:space-y-6">
      {/* Top Application Header */}
      <TopNavBar
        userInitial={userInitial}
        userDisplayName={userDisplayName}
      />

      {/* Breadcrumb & Main Heading Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#1a7fc4] transition-colors mb-2 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Dashboard</span>
          </Link>
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
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a7fc4] hover:bg-[#1565a8] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Start New Analysis</span>
          </Link>
        </div>
      </div>

      {/* Search, Filter & Sort Controls (moved directly below heading) */}
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
              className="appearance-none bg-white border border-gray-200/80 rounded-xl pl-3 pr-8 pt-4 pb-1 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a7fc4]/20 focus:border-[#1a7fc4] transition-all shadow-2xs cursor-pointer min-w-[125px]"
            >
              <option value="All Verdicts">All Verdicts</option>
              <option value="Potentially Forged">Potentially Forged</option>
              <option value="Likely Authentic">Likely Authentic</option>
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

      {/* Analysis Cards List */}
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
              {searchQuery || verdictFilter !== "All Verdicts"
                ? "No matching analyses found"
                : "No Past Analyses"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              {searchQuery || verdictFilter !== "All Verdicts"
                ? "Try adjusting your search query or filter options to find previous forensic records."
                : "You haven't run any image forensics yet. Upload your first image to generate forensic evidence."}
            </p>
            {searchQuery || verdictFilter !== "All Verdicts" ? (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            ) : (
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a7fc4] text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-[#1565a8] transition-colors shadow-xs"
              >
                <span>Start First Analysis</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Bottom Pagination & Count */}
      {totalItems > 0 && (
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
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
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
