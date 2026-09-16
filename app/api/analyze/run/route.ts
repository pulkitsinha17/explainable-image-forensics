/**
 * POST /api/analyze/run
 *
 * Proxy endpoint: downloads the image from S3 using the s3Key,
 * sends it to the FastAPI ML backend, saves the result to MongoDB,
 * and returns the structured analysis result.
 *
 * Body (JSON):
 *   { analysisId: string, s3Key: string }
 *
 * The analysisId must correspond to an existing MongoDB Analysis document
 * (created by /api/analyze/record before the S3 upload).
 *
 * Security:
 *   - Clerk auth enforced.
 *   - AWS credentials stay server-side.
 *   - ML_BACKEND_URL stays server-side.
 *   - MongoDB credentials stay server-side.
 *   - Filesystem paths from FastAPI are stored in DB only — never returned to client.
 *   - The overlay image is served via /api/analyze/mask/[analysisId].
 */
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, S3_BUCKET_NAME } from "@/lib/s3";
import { connectToDatabase } from "@/lib/mongodb";
import Analysis from "@/models/Analysis";

const ML_BACKEND_URL =
  process.env.ML_BACKEND_URL ?? "http://localhost:8001";

/** Shape of the ML backend /analyze JSON response body */
interface MLAnalysis {
  verdict: string;
  risk_score: number;
  proposed_risk_score?: number;
  confidence: number;
  localization: {
    mask_path: string | null;
    overlay_path: string | null;
    forgery_pixel_fraction: number;
  };
  evidence: {
    noise_residual: number;
    frequency_dct: number;
    ela: number;
    local_statistics: number;
  };
  mpc_risk_score: number;
  analysis_id: string;
}

export async function POST(req: NextRequest) {
  // 1. Authentication
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // 2. Parse body
  let body: { analysisId?: unknown; s3Key?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const analysisId =
    typeof body.analysisId === "string" ? body.analysisId.trim() : null;
  const s3Key =
    typeof body.s3Key === "string" ? body.s3Key.trim() : null;

  if (!analysisId || !s3Key) {
    return NextResponse.json(
      { error: "analysisId and s3Key are required." },
      { status: 400 }
    );
  }

  // 3. Fetch DB record to verify ownership
  await connectToDatabase();
  const record = await Analysis.findById(analysisId);
  if (!record) {
    return NextResponse.json(
      { error: "Analysis record not found." },
      { status: 404 }
    );
  }
  if (record.clerkUserId !== userId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  // 4. Update status → processing and store the s3Key
  record.status = "processing";
  record.s3Key = s3Key;
  await record.save();

  // 5. Download image from S3
  let imageBuffer: Buffer;
  try {
    const cmd = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
    });
    const s3Response = await s3Client.send(cmd);
    const chunks: Uint8Array[] = [];
    const stream = s3Response.Body as AsyncIterable<Uint8Array>;
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    imageBuffer = Buffer.concat(chunks);
  } catch (err) {
    console.error("[analyze/run] S3 download failed:", err);
    record.status = "failed";
    await record.save();
    return NextResponse.json(
      { error: "Failed to retrieve image from storage." },
      { status: 502 }
    );
  }

  // 6. Send to ML backend via multipart/form-data
  let mlAnalysis: MLAnalysis;
  try {
    const formData = new FormData();
    const mimeType = record.originalFilename?.match(/\.png$/i)
      ? "image/png"
      : "image/jpeg";
    const blob = new Blob([new Uint8Array(imageBuffer)], { type: mimeType });
    formData.append("file", blob, record.originalFilename ?? "image.jpg");
    formData.append("analysis_id", analysisId);

    const mlResponse = await fetch(`${ML_BACKEND_URL}/analyze`, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(120_000), // 2-minute timeout
    });

    if (!mlResponse.ok) {
      const text = await mlResponse.text();
      throw new Error(`ML backend returned ${mlResponse.status}: ${text}`);
    }

    const mlBody = await mlResponse.json() as { success?: boolean; analysis?: MLAnalysis; error?: string };

    if (!mlBody.success || !mlBody.analysis) {
      throw new Error(mlBody.error ?? "ML backend returned an unexpected response body.");
    }

    mlAnalysis = mlBody.analysis;

    // Validate required fields are present
    if (
      typeof mlAnalysis.verdict !== "string" ||
      typeof mlAnalysis.risk_score !== "number" ||
      typeof mlAnalysis.confidence !== "number"
    ) {
      throw new Error("ML backend response is missing required fields.");
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[analyze/run] ML backend call failed:", msg);
    record.status = "failed";
    await record.save();

    // Distinguish timeout from other failures
    const isTimeout = msg.includes("TimeoutError") || msg.includes("timeout");
    return NextResponse.json(
      {
        error: isTimeout
          ? "ML analysis timed out. The model may be loading — please try again."
          : `ML analysis service error: ${msg}`,
      },
      { status: 503 }
    );
  }

  // 7. Persist results in MongoDB
  //    overlayPath and maskPath are stored server-side ONLY — never returned to client.
  try {
    const verdict = mlAnalysis.verdict;

    record.status = "completed";
    record.detectionResult =
      verdict === "forged"
        ? "forged"
        : verdict === "authentic"
          ? "authentic"
          : "inconclusive";
    record.forgeryRiskScore = mlAnalysis.risk_score;
    record.proposedRiskScore = mlAnalysis.proposed_risk_score ?? mlAnalysis.risk_score;
    record.confidence = mlAnalysis.confidence;
    record.mpcRiskScore = mlAnalysis.mpc_risk_score;
    record.evidenceResults = mlAnalysis.evidence;
    record.localizationResult = {
      forgery_pixel_fraction: mlAnalysis.localization.forgery_pixel_fraction,
    };
    // Store filesystem paths server-side — used by /api/analyze/mask/[id]
    record.overlayPath = mlAnalysis.localization.overlay_path ?? undefined;
    record.maskPath = mlAnalysis.localization.mask_path ?? undefined;
    record.mlRawResult = mlAnalysis;
    await record.save();
  } catch (err) {
    console.error("[analyze/run] MongoDB update failed:", err);
    // Don't fail the whole request — return results even if DB update fails
  }

  // 8. Build a sanitised client response — NO filesystem paths
  //    The overlay image is served via /api/analyze/mask/[analysisId]
  const hasOverlay = Boolean(
    mlAnalysis.localization.overlay_path && record.overlayPath
  );

  return NextResponse.json({
    success: true,
    analysisId,
    result: {
      verdict: mlAnalysis.verdict,
      risk_score: mlAnalysis.risk_score,
      proposed_risk_score: mlAnalysis.proposed_risk_score ?? mlAnalysis.risk_score,
      confidence: mlAnalysis.confidence,
      mpc_risk_score: mlAnalysis.mpc_risk_score,
      evidence: mlAnalysis.evidence,
      localization: {
        forgery_pixel_fraction: mlAnalysis.localization.forgery_pixel_fraction,
        // Safe URL — no filesystem path exposed
        overlay_url: hasOverlay
          ? `/api/analyze/mask/${analysisId}`
          : null,
      },
    },
  });
}
