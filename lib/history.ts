/**
 * Shared service for retrieving canonical Analysis History and Dashboard statistics.
 *
 * Provides a single source of truth for both:
 * 1. /api/history (Analysis History page)
 * 2. app/dashboard/page.tsx (PIXENTRA Dashboard)
 *
 * Security:
 * - Strictly scoped to the authenticated Clerk user's ID.
 * - Generates secure pre-signed S3 URLs server-side.
 */

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, S3_BUCKET_NAME } from "@/lib/s3";
import { connectToDatabase } from "@/lib/mongodb";
import Analysis from "@/models/Analysis";
import type { CompletedAnalysisRecord, HistorySummaryStats } from "@/components/history/types";

export interface ActivityDataPoint {
  date: string;
  day: string;
  fullDate: string;
  count: number;
}

export interface ActivityTimelines {
  last7Days: ActivityDataPoint[];
  last30Days: ActivityDataPoint[];
  allTime: ActivityDataPoint[];
}

export interface MetricDeltas {
  totalAnalysesChange: number | null;
  analysesThisMonthChange: number | null;
  manipulatedDetectedChange: number | null;
  averageRiskScoreChange: number | null;
}

export interface UserAnalysisData {
  records: CompletedAnalysisRecord[];
  stats: HistorySummaryStats;
  analysesThisMonth: number;
  activityTimeline: ActivityDataPoint[];
  timelines: ActivityTimelines;
  deltas: MetricDeltas;
}

export async function getUserAnalysisHistory(clerkUserId: string): Promise<UserAnalysisData> {
  const emptyActivity: ActivityDataPoint[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const dayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    emptyActivity.push({
      date: dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      day: dayDate.toLocaleDateString("en-US", { weekday: "short" }),
      fullDate: dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      count: 0,
    });
  }

  const emptyTimelines: ActivityTimelines = {
    last7Days: emptyActivity,
    last30Days: [],
    allTime: [],
  };

  const emptyDeltas: MetricDeltas = {
    totalAnalysesChange: null,
    analysesThisMonthChange: null,
    manipulatedDetectedChange: null,
    averageRiskScoreChange: null,
  };

  if (!clerkUserId) {
    return {
      records: [],
      stats: {
        totalAnalyses: 0,
        completedCount: 0,
        authenticatedCount: 0,
        manipulatedCount: 0,
        inconclusiveCount: 0,
        potentiallyForgedCount: 0,
        averageRiskPercentage: 0,
      },
      analysesThisMonth: 0,
      activityTimeline: emptyActivity,
      timelines: emptyTimelines,
      deltas: emptyDeltas,
    };
  }

  await connectToDatabase();

  // 1. Fetch all analysis records belonging to the authenticated user, newest first
  const dbRecords = await Analysis.find({ clerkUserId })
    .sort({ createdAt: -1 })
    .lean();

  // 2. Map records & generate S3 presigned thumbnail URLs in parallel
  const records: CompletedAnalysisRecord[] = await Promise.all(
    dbRecords.map(async (record) => {
      const id = String(record._id);
      const filename = record.originalFilename || "analyzed_image.jpg";

      // Derive format from filename extension
      let format = "JPEG";
      if (/\.png$/i.test(filename)) format = "PNG";
      else if (/\.webp$/i.test(filename)) format = "WEBP";
      else if (/\.tiff?$/i.test(filename)) format = "TIFF";
      else if (/\.bmp$/i.test(filename)) format = "BMP";

      // Derive verdict directly from the persisted analysis results
      let verdict: "forged" | "authentic" | "inconclusive" = "inconclusive";
      let verdictLabel = "Inconclusive";

      const rawMl = (record.mlRawResult as {
        manipulation_probability?: number;
        authenticity_probability?: number;
        forensic_manipulation_score?: number;
        forensic_authenticity_score?: number;
        hybrid_verdict?: string;
        classifier_verdict?: string;
        verdict?: string;
      } | undefined) || {};

      const detection =
        rawMl.hybrid_verdict ||
        record.detectionResult ||
        rawMl.verdict;

      if (detection === "forged" || detection === "likely_manipulated" || detection === "manipulated") {
        verdict = "forged";
        verdictLabel = "Manipulated";
      } else if (detection === "authentic" || detection === "authenticated") {
        verdict = "authentic";
        verdictLabel = "Authentic";
      } else if (detection === "inconclusive" || detection === "suspicious") {
        verdict = "inconclusive";
        verdictLabel = "Inconclusive";
      } else if (record.status === "failed") {
        verdict = "inconclusive";
        verdictLabel = "Not available";
      } else if (record.status === "processing" || record.status === "pending") {
        verdict = "inconclusive";
        verdictLabel = "Processing";
      } else {
        verdict = "inconclusive";
        verdictLabel = "Not available";
      }

      // Exact Manipulation Probability Score & Forensic Scores from DB with backward compatibility
      let forensicManipulationScore: number | null = null;
      if (typeof rawMl.forensic_manipulation_score === "number" && !isNaN(rawMl.forensic_manipulation_score)) {
        forensicManipulationScore = Number((rawMl.forensic_manipulation_score * 100).toFixed(1));
      } else if (typeof rawMl.manipulation_probability === "number" && !isNaN(rawMl.manipulation_probability)) {
        forensicManipulationScore = Number((rawMl.manipulation_probability * 100).toFixed(1));
      } else if (typeof record.forgeryRiskScore === "number" && !isNaN(record.forgeryRiskScore)) {
        forensicManipulationScore = Number((record.forgeryRiskScore * 100).toFixed(1));
      }

      let forensicAuthenticityScore: number | null = null;
      if (typeof rawMl.forensic_authenticity_score === "number" && !isNaN(rawMl.forensic_authenticity_score)) {
        forensicAuthenticityScore = Number((rawMl.forensic_authenticity_score * 100).toFixed(1));
      } else if (forensicManipulationScore !== null) {
        forensicAuthenticityScore = Number(Math.max(0, 100 - forensicManipulationScore).toFixed(1));
      } else if (typeof rawMl.authenticity_probability === "number" && !isNaN(rawMl.authenticity_probability)) {
        forensicAuthenticityScore = Number((rawMl.authenticity_probability * 100).toFixed(1));
      }

      const manipulationProbability =
        typeof rawMl.manipulation_probability === "number" && !isNaN(rawMl.manipulation_probability)
          ? Math.round(rawMl.manipulation_probability * 100)
          : typeof record.forgeryRiskScore === "number" && !isNaN(record.forgeryRiskScore)
          ? Math.round(record.forgeryRiskScore * 100)
          : null;

      const authenticityProbability =
        typeof rawMl.authenticity_probability === "number" && !isNaN(rawMl.authenticity_probability)
          ? Math.round(rawMl.authenticity_probability * 100)
          : manipulationProbability != null
          ? Math.max(0, 100 - manipulationProbability)
          : null;

      const forgeryAnomalyScore = forensicManipulationScore ?? manipulationProbability;
      const riskScore = forensicManipulationScore ?? manipulationProbability ?? 0;

      // Generate pre-signed S3 thumbnail URL if s3Key exists
      let thumbnailUrl = "";
      if (record.s3Key) {
        try {
          const cmd = new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: record.s3Key,
          });
          thumbnailUrl = await getSignedUrl(s3Client, cmd, { expiresIn: 3600 });
        } catch (err) {
          console.error(`[lib/history] Presigned URL failed for record ${id}:`, err);
        }
      }

      // Format date
      const createdAtDate = record.createdAt ? new Date(record.createdAt) : new Date();
      const analyzedTimestamp = createdAtDate.getTime();
      const analyzedAt = createdAtDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) + ` at ` + createdAtDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        id,
        filename,
        format,
        dimensions: "5120 × 2880",
        fileSizeFormatted: "121.6 KB",
        analyzedAt,
        analyzedTimestamp,
        verdict,
        verdictLabel,
        forgeryAnomalyScore,
        manipulationProbability,
        authenticityProbability,
        forensicManipulationScore,
        forensicAuthenticityScore,
        riskScore,
        thumbnailUrl,
        status: (record.status as "completed" | "processing" | "failed" | "pending") || "completed",
      };
    })
  );

  // 3. Calculate summary statistics (100% synchronized interpretation)
  const totalAnalyses = records.length;
  const completedRecords = records.filter((r) => r.status === "completed");
  const completedCount = completedRecords.length;
  const authenticatedCount = completedRecords.filter((r) => r.verdict === "authentic").length;
  const manipulatedCount = completedRecords.filter((r) => r.verdict === "forged").length;
  const inconclusiveCount = completedRecords.filter((r) => r.verdict === "inconclusive").length;
  const potentiallyForgedCount = manipulatedCount;

  const totalRisk = completedRecords.reduce((acc, curr) => acc + curr.riskScore, 0);
  const averageRiskPercentage = completedCount > 0 ? Math.round(totalRisk / completedCount) : 0;

  // 4. Calculate analyses this calendar month & comparison deltas
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).getTime();
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0).getTime();

  const analysesThisMonth = completedRecords.filter(
    (r) => r.analyzedTimestamp >= startOfCurrentMonth
  ).length;

  const analysesLastMonth = completedRecords.filter(
    (r) => r.analyzedTimestamp >= startOfPrevMonth && r.analyzedTimestamp < startOfCurrentMonth
  ).length;

  let analysesThisMonthChange: number | null = null;
  if (analysesLastMonth > 0) {
    analysesThisMonthChange = Math.round(((analysesThisMonth - analysesLastMonth) / analysesLastMonth) * 100);
  } else if (analysesThisMonth > 0) {
    analysesThisMonthChange = 100;
  }

  // 30-day period comparisons for Total Analyses & Manipulated
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const currentPeriodStart = now.getTime() - thirtyDaysMs;
  const priorPeriodStart = now.getTime() - 2 * thirtyDaysMs;

  const currPeriodRecords = completedRecords.filter((r) => r.analyzedTimestamp >= currentPeriodStart);
  const priorPeriodRecords = completedRecords.filter(
    (r) => r.analyzedTimestamp >= priorPeriodStart && r.analyzedTimestamp < currentPeriodStart
  );

  let totalAnalysesChange: number | null = null;
  if (priorPeriodRecords.length > 0) {
    totalAnalysesChange = Math.round(
      ((currPeriodRecords.length - priorPeriodRecords.length) / priorPeriodRecords.length) * 100
    );
  } else if (currPeriodRecords.length > 0) {
    totalAnalysesChange = 100;
  }

  const currManipulated = currPeriodRecords.filter((r) => r.verdict === "forged").length;
  const priorManipulated = priorPeriodRecords.filter((r) => r.verdict === "forged").length;

  let manipulatedDetectedChange: number | null = null;
  if (priorManipulated > 0) {
    manipulatedDetectedChange = Math.round(((currManipulated - priorManipulated) / priorManipulated) * 100);
  } else if (currManipulated > 0) {
    manipulatedDetectedChange = 100;
  }

  const currAvgRisk =
    currPeriodRecords.length > 0
      ? Math.round(currPeriodRecords.reduce((acc, c) => acc + c.riskScore, 0) / currPeriodRecords.length)
      : 0;
  const priorAvgRisk =
    priorPeriodRecords.length > 0
      ? Math.round(priorPeriodRecords.reduce((acc, c) => acc + c.riskScore, 0) / priorPeriodRecords.length)
      : 0;

  let averageRiskScoreChange: number | null = null;
  if (priorAvgRisk > 0) {
    averageRiskScoreChange = Math.round(((currAvgRisk - priorAvgRisk) / priorAvgRisk) * 100);
  } else if (currAvgRisk > 0) {
    averageRiskScoreChange = 100;
  }

  const deltas: MetricDeltas = {
    totalAnalysesChange,
    analysesThisMonthChange,
    manipulatedDetectedChange,
    averageRiskScoreChange,
  };

  // 5. Build Timelines for Last 7 Days, Last 30 Days, and All Time from real DB records

  // A. Last 7 Days
  const last7Days: ActivityDataPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dayStart = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 0, 0, 0, 0).getTime();
    const dayEnd = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 23, 59, 59, 999).getTime();

    const count = completedRecords.filter(
      (r) => r.analyzedTimestamp >= dayStart && r.analyzedTimestamp <= dayEnd
    ).length;

    last7Days.push({
      date: dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      day: dayDate.toLocaleDateString("en-US", { weekday: "short" }),
      fullDate: dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      count,
    });
  }

  // B. Last 30 Days (Daily resolution over the past 30 days)
  const last30Days: ActivityDataPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const dayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dayStart = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 0, 0, 0, 0).getTime();
    const dayEnd = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 23, 59, 59, 999).getTime();

    const count = completedRecords.filter(
      (r) => r.analyzedTimestamp >= dayStart && r.analyzedTimestamp <= dayEnd
    ).length;

    last30Days.push({
      date: dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      day: String(dayDate.getDate()),
      fullDate: dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      count,
    });
  }

  // C. All Time (Grouped by past 6-12 calendar months)
  const allTime: ActivityDataPoint[] = [];
  const numMonths = 6;
  for (let m = numMonths - 1; m >= 0; m--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1, 0, 0, 0, 0).getTime();
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999).getTime();

    const count = completedRecords.filter(
      (r) => r.analyzedTimestamp >= monthStart && r.analyzedTimestamp <= monthEnd
    ).length;

    allTime.push({
      date: monthDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      day: monthDate.toLocaleDateString("en-US", { month: "short" }),
      fullDate: monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      count,
    });
  }

  const timelines: ActivityTimelines = {
    last7Days,
    last30Days,
    allTime,
  };

  const stats: HistorySummaryStats = {
    totalAnalyses,
    completedCount,
    authenticatedCount,
    manipulatedCount,
    inconclusiveCount,
    potentiallyForgedCount,
    averageRiskPercentage,
  };

  return {
    records,
    stats,
    analysesThisMonth,
    activityTimeline: last7Days,
    timelines,
    deltas,
  };
}
