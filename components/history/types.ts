export type ForensicVerdict = "forged" | "authentic" | "inconclusive";

export interface CompletedAnalysisRecord {
  id: string;
  filename: string;
  format: string; // e.g. "JPEG", "PNG", "WEBP", "TIFF"
  dimensions: string; // e.g. "5120 × 2880"
  fileSizeFormatted: string; // e.g. "121.6 KB", "2.4 MB"
  analyzedAt: string; // e.g. "Sep 14, 2026 at 10:24 AM"
  analyzedTimestamp: number; // for sorting
  verdict: ForensicVerdict;
  verdictLabel: string; // e.g. "Appears Authentic", "Likely Manipulated", "Inconclusive"
  forgeryAnomalyScore: number | null; // 0 to 100 or null if not available
  riskScore: number; // 0 to 100 for backward compatibility and sorting
  thumbnailUrl: string;
  status?: "completed" | "processing" | "failed" | "pending";
}

export interface HistorySummaryStats {
  totalAnalyses: number;
  completedCount: number;
  authenticatedCount?: number;
  manipulatedCount?: number;
  inconclusiveCount?: number;
  potentiallyForgedCount: number;
  averageRiskPercentage: number;
}

