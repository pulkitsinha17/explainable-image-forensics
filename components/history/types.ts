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
  verdictLabel: "Potentially Forged" | "Likely Authentic" | "Inconclusive";
  riskScore: number; // 0 to 100
  thumbnailUrl: string;
}

export interface HistorySummaryStats {
  totalAnalyses: number;
  completedCount: number;
  potentiallyForgedCount: number;
  averageRiskPercentage: number;
}
