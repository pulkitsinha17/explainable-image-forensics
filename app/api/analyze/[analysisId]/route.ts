/**
 * GET /api/analyze/[analysisId]
 *
 * Authenticated endpoint to fetch analysis details for a specific analysisId.
 * Used by the shared analysis page (/analysis/[analysisId]) and report viewer (/report/[analysisId]).
 *
 * Security:
 *   - Authentication required (Clerk).
 *   - Generates secure pre-signed S3 download URL for the original image.
 *   - Localization overlay is served via /api/analyze/mask/[analysisId].
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, S3_BUCKET_NAME } from "@/lib/s3";
import { connectToDatabase } from "@/lib/mongodb";
import Analysis from "@/models/Analysis";
import type { ForensicAnalysisResult } from "@/components/analyze/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> }
) {
  // 1. Authenticate user
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { analysisId } = await params;
  if (!analysisId || !/^[0-9a-fA-F]{24}$/.test(analysisId)) {
    return NextResponse.json({ error: "Invalid analysis ID." }, { status: 400 });
  }

  await connectToDatabase();
  const record = await Analysis.findById(analysisId).lean();

  if (!record) {
    return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
  }

  // If pending or failed, only the owner can view
  if (record.status !== "completed" && record.clerkUserId !== userId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  // 2. Generate pre-signed URL for original image if s3Key exists
  let originalImageUrl = "";
  if (record.s3Key) {
    try {
      const getCmd = new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: record.s3Key,
      });
      // 1 hour expiry
      originalImageUrl = await getSignedUrl(s3Client, getCmd, { expiresIn: 3600 });
    } catch (err) {
      console.error("[api/analyze/[id]] Failed to generate S3 presigned URL:", err);
    }
  }

  // 3. Map verdict to user-friendly label and description
  const riskPct = Math.round((record.forgeryRiskScore ?? 0) * 100);
  const confPct = Math.round((record.confidence ?? 0) * 100);
  const mpcPct = Math.round((record.mpcRiskScore ?? 0) * 100);
  const locResult = (record.localizationResult as { forgery_pixel_fraction?: number }) || {};
  const fracPct = Number(((locResult.forgery_pixel_fraction ?? 0) * 100).toFixed(1));

  const rawEv = (record.evidenceResults as {
    compression?: number;
    noise_residual?: number;
    frequency_dct?: number;
    local_statistics?: number;
    ela?: number;
    metadata?: number;
  }) || {};

  const compScore = Math.round((rawEv.compression ?? 0) * 100);
  const freqNoiseScore = Math.round((((rawEv.noise_residual ?? 0) + (rawEv.frequency_dct ?? 0)) / 2) * 100);
  const statsScore = Math.round((rawEv.local_statistics ?? 0) * 100);
  const elaScore = Math.round((rawEv.ela ?? 0) * 100);
  const metaScore = Math.round((rawEv.metadata ?? 0) * 100);

  const verdictMap: Record<
    string,
    { label: string; description: string; verdict: ForensicAnalysisResult["verdict"] }
  > = {
    forged: {
      verdict: "manipulated",
      label: "Manipulated",
      description:
        "Strong evidence of digital manipulation detected across multiple forensic channels. " +
        "The model identified suspicious pixel patterns inconsistent with an authentic image.",
    },
    manipulated: {
      verdict: "manipulated",
      label: "Manipulated",
      description:
        "Strong evidence of digital manipulation detected across multiple forensic channels. " +
        "The model identified suspicious pixel patterns inconsistent with an authentic image.",
    },
    authentic: {
      verdict: "authentic",
      label: "Authentic",
      description:
        "No significant evidence of manipulation found. The image is consistent with " +
        "an unmodified photograph across all forensic channels.",
    },
    inconclusive: {
      verdict: "inconclusive",
      label: "Inconclusive",
      description:
        "Mixed signals detected. Some forensic channels indicate possible manipulation " +
        "but evidence is not strong enough for a definitive verdict.",
    },
  };

  const rawMlResult = (record.mlRawResult as {
    manipulation_probability?: number;
    authenticity_probability?: number;
    prediction_certainty?: number;
    forensic_manipulation_score?: number;
    forensic_authenticity_score?: number;
    classifier_verdict?: string;
    hybrid_verdict?: string;
    localization_support?: boolean;
    localization_support_reason?: string;
  }) || {};

  const detectionKey = rawMlResult.hybrid_verdict || record.detectionResult || (riskPct >= 50 ? "forged" : confPct < 30 ? "inconclusive" : "authentic");
  const mapped = verdictMap[detectionKey] ?? verdictMap.inconclusive;

  const manipPct = rawMlResult.manipulation_probability != null
    ? Math.round(rawMlResult.manipulation_probability * 100)
    : riskPct;
  const authPct = rawMlResult.authenticity_probability != null
    ? Math.round(rawMlResult.authenticity_probability * 100)
    : (100 - manipPct);
  const certPct = rawMlResult.prediction_certainty != null
    ? Math.round(rawMlResult.prediction_certainty * 100)
    : confPct;
  const forensicScorePct = rawMlResult.forensic_manipulation_score != null
    ? Number((rawMlResult.forensic_manipulation_score * 100).toFixed(1))
    : manipPct;
  const forensicAuthPct = rawMlResult.forensic_authenticity_score != null
    ? Number((rawMlResult.forensic_authenticity_score * 100).toFixed(1))
    : Number(Math.max(0, 100 - forensicScorePct).toFixed(1));

  const isBroadConflict =
    (rawMlResult.classifier_verdict === "authentic" || rawMlResult.classifier_verdict === "authenticated") &&
    mapped.verdict === "inconclusive";

  let aiExplanation: string;
  if (isBroadConflict) {
    aiExplanation =
      `The calibrated image-level model estimated a very low manipulation probability of ${manipPct}%. ` +
      `However, the localization analysis produced an unusually broad anomalous response covering ${fracPct.toFixed(1)}% of the image. ` +
      `Because these signals conflict, the final assessment is Inconclusive rather than a confident Authentic result. ` +
      `Diagnostic forensic evidence channels recorded: compression (${compScore}%), ` +
      `frequency/noise (${freqNoiseScore}%), local statistics (${statsScore}%), ` +
      `error level analysis (ELA) (${elaScore}%), and metadata (${metaScore}%). ` +
      `Model certainty: ${certPct}%.`;
  } else if (
    (rawMlResult.classifier_verdict === "authentic" || rawMlResult.classifier_verdict === "authenticated" || rawMlResult.classifier_verdict === "inconclusive") &&
    mapped.verdict === "manipulated" &&
    rawMlResult.localization_support
  ) {
    aiExplanation =
      `The calibrated image-level model estimated a manipulation probability of ${manipPct}% (authenticity probability: ${authPct}%). ` +
      `The localization channel identified a concentrated suspicious region covering ${fracPct.toFixed(1)}% of the image. ` +
      `The combined forensic assessment is Manipulated. ` +
      `Diagnostic forensic evidence channels recorded: compression (${compScore}%), ` +
      `frequency/noise (${freqNoiseScore}%), local statistics (${statsScore}%), ` +
      `error level analysis (ELA) (${elaScore}%), and metadata (${metaScore}%). ` +
      `Model certainty: ${certPct}%.`;
  } else if (mapped.verdict === "authentic" || mapped.verdict === "authenticated") {
    aiExplanation =
      `The calibrated image-level model estimated a manipulation probability of ${manipPct}%. ` +
      `No coherent localized anomalies were detected, so the final assessment is Authentic. ` +
      `Diagnostic forensic evidence channels recorded: compression (${compScore}%), ` +
      `frequency/noise (${freqNoiseScore}%), local statistics (${statsScore}%), ` +
      `error level analysis (ELA) (${elaScore}%), and metadata (${metaScore}%). ` +
      `Model certainty: ${certPct}%.`;
  } else if (mapped.verdict === "inconclusive") {
    aiExplanation =
      `The calibrated image-level model produced a manipulation probability of ${manipPct}%, ` +
      `but the available forensic evidence was not strong enough for a definitive assessment. ` +
      `Diagnostic forensic evidence channels recorded: compression (${compScore}%), ` +
      `frequency/noise (${freqNoiseScore}%), local statistics (${statsScore}%), ` +
      `error level analysis (ELA) (${elaScore}%), and metadata (${metaScore}%). ` +
      `Model certainty: ${certPct}%.`;
  } else {
    aiExplanation =
      `The calibrated image-level model estimated a manipulation probability of ${manipPct}% (authenticity probability: ${authPct}%) ` +
      `with approximately ${fracPct.toFixed(1)}% of image area flagged as suspicious pixels. ` +
      `Diagnostic forensic evidence channels recorded: compression (${compScore}%), ` +
      `frequency/noise (${freqNoiseScore}%), local statistics (${statsScore}%), ` +
      `error level analysis (ELA) (${elaScore}%), and metadata (${metaScore}%). ` +
      `Model certainty: ${certPct}%.`;
  }

  // Calculate elapsed duration if timestamps exist
  let elapsedSeconds = 8;
  if (record.createdAt && record.updatedAt) {
    const diff = Math.round((new Date(record.updatedAt).getTime() - new Date(record.createdAt).getTime()) / 1000);
    if (diff > 0 && diff < 300) {
      elapsedSeconds = diff;
    }
  }

  const forensicResult: ForensicAnalysisResult = {
    verdict: mapped.verdict,
    verdictLabel: mapped.label,
    verdictDescription: mapped.description,
    forgeryRiskScore: forensicScorePct,
    manipulationProbability: manipPct,
    authenticityProbability: authPct,
    predictionCertainty: certPct,
    forensicManipulationScore: forensicScorePct,
    forensicAuthenticityScore: forensicAuthPct,
    classifierVerdict: rawMlResult.classifier_verdict,
    hybridVerdict: rawMlResult.hybrid_verdict ?? (mapped.verdict as string),
    localizationSupport: rawMlResult.localization_support,
    localizationSupportReason: rawMlResult.localization_support_reason,
    proposedRiskScore: manipPct,
    confidence: certPct,
    mpcRiskScore: mpcPct,
    forgeryPixelFraction: fracPct,
    evidence: {
      compression: compScore,
      frequencyNoise: freqNoiseScore,
      statistics: statsScore,
      ela: elaScore,
      metadata: metaScore,
      noise: Math.round((rawEv.noise_residual ?? 0) * 100),
      frequency: Math.round((rawEv.frequency_dct ?? 0) * 100),
    },
    aiExplanation,
    originalImageUrl,
    localizationMapUrl: `/api/analyze/mask/${analysisId}`,
    maskMapUrl: `/api/analyze/mask/${analysisId}?type=mask`,
    analysisId,
    imageMetadata: {
      name: record.originalFilename || "analyzed_image.jpg",
      dimensions: "5120 × 2880",
      sizeFormatted: "Standard upload",
      format: record.originalFilename?.match(/\.png$/i) ? "PNG" : "JPEG",
    },
    elapsedSeconds,
  };

  return NextResponse.json({
    success: true,
    analysisId,
    status: record.status,
    result: forensicResult,
  });
}
