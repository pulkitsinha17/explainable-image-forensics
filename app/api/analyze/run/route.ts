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
 * (created by the frontend after the S3 upload).
 */
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, S3_BUCKET_NAME } from "@/lib/s3";
import { connectToDatabase } from "@/lib/mongodb";
import Analysis from "@/models/Analysis";

const ML_BACKEND_URL =
  process.env.ML_BACKEND_URL ?? "http://localhost:8001";

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
    return NextResponse.json(
      { error: "Forbidden." },
      { status: 403 }
    );
  }

  // 4. Update status → processing
  record.status = "processing";
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

  // 6. Send to ML backend
  let mlResult: Record<string, unknown>;
  try {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(imageBuffer)], {
      type: record.originalFilename?.match(/\.png$/i)
        ? "image/png"
        : "image/jpeg",
    });
    formData.append("file", blob, record.originalFilename ?? "image.jpg");
    formData.append("analysis_id", analysisId);

    const mlResponse = await fetch(`${ML_BACKEND_URL}/analyze`, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(120_000), // 2 minute timeout
    });

    if (!mlResponse.ok) {
      const text = await mlResponse.text();
      throw new Error(`ML backend returned ${mlResponse.status}: ${text}`);
    }

    const mlBody = await mlResponse.json();
    if (!mlBody.success || !mlBody.analysis) {
      throw new Error(mlBody.error ?? "ML backend returned unexpected body.");
    }
    mlResult = mlBody.analysis;
  } catch (err) {
    console.error("[analyze/run] ML backend call failed:", err);
    record.status = "failed";
    await record.save();
    return NextResponse.json(
      {
        error:
          "ML analysis service is unavailable. " +
          "Ensure the FastAPI backend is running on port 8001.",
      },
      { status: 503 }
    );
  }

  // 7. Persist results in MongoDB
  try {
    const analysis = mlResult as {
      verdict: string;
      risk_score: number;
      evidence: Record<string, number>;
      localization: { forgery_pixel_fraction: number };
    };

    record.status = "completed";
    record.detectionResult =
      analysis.verdict === "forged"
        ? "forged"
        : analysis.verdict === "authentic"
          ? "authentic"
          : "inconclusive";
    record.forgeryRiskScore = analysis.risk_score;
    record.evidenceResults = analysis.evidence;
    record.localizationResult = analysis.localization;
    await record.save();
  } catch (err) {
    console.error("[analyze/run] MongoDB update failed:", err);
    // Don't fail the whole request — results are still returned
  }

  return NextResponse.json({
    success: true,
    analysisId,
    result: mlResult,
  });
}
