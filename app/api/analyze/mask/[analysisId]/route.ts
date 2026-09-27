/**
 * GET /api/analyze/mask/[analysisId]
 *
 * Securely serves the localization overlay and mask PNGs.
 *
 * Architecture:
 *   - Primary (Decoupled Production / Vercel):
 *     Retrieves the asset directly from AWS S3 using the user-scoped S3 key
 *     stored in MongoDB (e.g. users/{userId}/analyses/{analysisId}/overlay.png).
 *     Next.js has no dependency on the FastAPI filesystem.
 *   - Fallback (Legacy Local Development):
 *     If an older record lacks an S3 key, checks the local outputs directory
 *     with strict path traversal guards.
 *
 * Security model:
 *   - Clerk authentication enforced — unauthenticated requests rejected (401).
 *   - Ownership verified — users can only access assets belonging to their analysis (404).
 *   - AWS credentials remain server-side; S3 bucket remains private.
 *   - Streamed directly as image/png with immutable caching.
 */
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, S3_BUCKET_NAME } from "@/lib/s3";
import { connectToDatabase } from "@/lib/mongodb";
import Analysis from "@/models/Analysis";

/**
 * Absolute path to the ml_backend/outputs directory.
 * Used ONLY as a fallback for legacy local dev records.
 */
const OUTPUTS_ROOT = path.resolve(
  process.cwd(),
  "ml_backend",
  "outputs"
);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> }
) {
  // 1. Authenticate
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { analysisId } = await params;

  // 2. Validate analysisId format (MongoDB ObjectId: 24 hex chars)
  if (!/^[0-9a-fA-F]{24}$/.test(analysisId)) {
    return new NextResponse("Invalid analysisId", { status: 400 });
  }

  // 3. Look up the record in MongoDB
  await connectToDatabase();
  const record = await Analysis.findById(analysisId).select(
    "clerkUserId overlayS3Key maskS3Key overlayPath maskPath status"
  );

  if (!record) {
    return new NextResponse("Analysis not found", { status: 404 });
  }

  // 4. Only the owner may access their analysis assets
  if (record.clerkUserId !== userId) {
    // Return 404 to avoid leaking existence of other users' analyses
    return new NextResponse("Analysis not found", { status: 404 });
  }

  // 5. Check requested asset (default: overlay; ?type=mask: binary mask)
  const { searchParams } = new URL(_req.url);
  const isMask = searchParams.get("type") === "mask";
  const s3Key: string | undefined | null = (
    isMask ? record.maskS3Key : record.overlayS3Key
  ) as string | undefined | null;

  // 6. PRIMARY PRODUCTION PATH: Retrieve directly from S3
  if (s3Key) {
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
      const imageBuffer = Buffer.concat(chunks);
      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          "Content-Type": s3Response.ContentType || "image/png",
          "Cache-Control": "private, max-age=3600, immutable",
          "Content-Length": String(imageBuffer.byteLength),
        },
      });
    } catch (err: unknown) {
      console.error("[mask] S3 retrieval failed for key=%s:", s3Key, err);
      return new NextResponse(
        `${isMask ? "Mask" : "Overlay"} not found in storage`,
        { status: 404 }
      );
    }
  }

  // 7. FALLBACK PATH: Local filesystem (for legacy records prior to S3 migration)
  const targetPath: string | undefined | null = (
    isMask ? record.maskPath : record.overlayPath
  ) as string | undefined | null;

  if (targetPath) {
    const resolvedPath = path.resolve(targetPath);
    if (
      resolvedPath.startsWith(OUTPUTS_ROOT + path.sep) ||
      resolvedPath.startsWith(OUTPUTS_ROOT + "/") ||
      resolvedPath === OUTPUTS_ROOT
    ) {
      try {
        const fileBytes = await readFile(resolvedPath);
        return new NextResponse(fileBytes, {
          status: 200,
          headers: {
            "Content-Type": "image/png",
            "Cache-Control": "private, max-age=3600, immutable",
            "Content-Length": String(fileBytes.byteLength),
          },
        });
      } catch (err: unknown) {
        const isNotFound =
          err instanceof Error &&
          "code" in err &&
          (err as NodeJS.ErrnoException).code === "ENOENT";
        if (isNotFound) {
          return new NextResponse(
            `${isMask ? "Mask" : "Overlay"} file not found on server`,
            { status: 404 }
          );
        }
        console.error("[mask] Failed to read local file:", err);
      }
    }
  }

  return new NextResponse(
    `${isMask ? "Mask" : "Overlay"} not available for this analysis`,
    { status: 404 }
  );
}
