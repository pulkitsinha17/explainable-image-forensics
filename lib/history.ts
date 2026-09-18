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

export interface UserAnalysisData {
  records: CompletedAnalysisRecord[];
  stats: HistorySummaryStats;
  analysesThisMonth: number;
}

export async function getUserAnalysisHistory(clerkUserId: string): Promise<UserAnalysisData> {
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

      const detection =
        record.detectionResult ||
        (record.mlRawResult as { verdict?: string } | undefined)?.verdict;

      if (detection === "forged" || detection === "likely_manipulated") {
        verdict = "forged";
        verdictLabel = "Likely Manipulated";
      } else if (detection === "authentic") {
        verdict = "authentic";
        verdictLabel = "Appears Authentic";
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

      // Exact Forgery Anomaly Score from DB (0.0 to 1.0 -> 0% to 100%)
      const forgeryAnomalyScore =
        typeof record.forgeryRiskScore === "number" && !isNaN(record.forgeryRiskScore)
          ? Math.round(record.forgeryRiskScore * 100)
          : null;

      const riskScore = forgeryAnomalyScore ?? 0;

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
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      return {
        id,
        filename,
        format,
        dimensions: "5120 × 2880",
        fileSizeFormatted: "Standard upload",
        analyzedAt,
        analyzedTimestamp,
        verdict,
        verdictLabel,
        forgeryAnomalyScore,
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

  // 4. Calculate analyses this calendar month based on real createdAt date
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).getTime();
  const analysesThisMonth = completedRecords.filter(
    (r) => r.analyzedTimestamp >= startOfCurrentMonth
  ).length;

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
  };
}
