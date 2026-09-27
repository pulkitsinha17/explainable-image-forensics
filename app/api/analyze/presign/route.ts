import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import {
  s3Client,
  S3_BUCKET_NAME,
  ALLOWED_MIME_TYPES,
  MAX_UPLOAD_BYTES,
} from "@/lib/s3";
import { getUserUsageAndLimit } from "@/lib/subscription";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/analyze/presign
 *
 * Accepts a JSON body:
 *   { filename: string, contentType: string, fileSizeBytes: number }
 *
 * Returns:
 *   { uploadUrl: string, s3Key: string }
 *
 * Security:
 *   - Clerk authentication is enforced — unauthenticated requests are rejected.
 *   - Sliding-window rate limiting applied per user.
 *   - Server-side usage quota/limit is verified before granting upload permissions.
 *   - Content-type and file size are validated server-side.
 *   - The S3 key is generated server-side from the authenticated userId;
 *     the client cannot influence which key is used.
 *   - AWS credentials never leave this server-side handler.
 *   - The presigned URL expires in 5 minutes.
 */
export async function POST(req: NextRequest) {
  // 1. Authenticate via Clerk
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in to upload images." },
      { status: 401 }
    );
  }

  // 2. Rate limit (20 presign requests per minute per user)
  const rateLimit = checkRateLimit(`presign:${userId}`, { maxRequests: 20, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many upload requests. Please wait a moment and try again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateLimit.resetMs / 1000)),
        },
      }
    );
  }

  // 3. Check server-side analysis quota limit (bypassed in development mode)
  try {
    const isDev = process.env.NODE_ENV === "development";
    const usage = await getUserUsageAndLimit(userId);
    if (!isDev && usage.isLimitReached) {
      return NextResponse.json(
        {
          error: `Analysis limit reached (${usage.used}/${usage.limit} analyses on ${usage.planName} plan). Please upgrade your plan to continue analyzing images.`,
          limitReached: true,
          usage,
        },
        { status: 403 }
      );
    }
  } catch (err) {
    console.error("[presign] Usage check error:", err);
    // Don't block upload if db lookup fails unexpectedly
  }

  // 3. Parse and validate the request body
  let body: { filename?: unknown; contentType?: unknown; fileSizeBytes?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Expected JSON." },
      { status: 400 }
    );
  }

  const filename =
    typeof body.filename === "string" ? body.filename.trim() : null;
  const contentType =
    typeof body.contentType === "string" ? body.contentType.trim().toLowerCase() : null;
  const fileSizeBytes =
    typeof body.fileSizeBytes === "number" ? body.fileSizeBytes : null;

  // 3. Validate filename
  if (!filename || filename.length === 0 || filename.length > 255) {
    return NextResponse.json(
      { error: "Invalid filename." },
      { status: 400 }
    );
  }

  // 4. Validate content type (server-side; do NOT trust client)
  if (!contentType || !(contentType in ALLOWED_MIME_TYPES)) {
    return NextResponse.json(
      {
        error: `Unsupported file type: ${contentType ?? "unknown"}. Allowed: JPEG, PNG, WEBP, TIFF.`,
      },
      { status: 400 }
    );
  }

  // 5. Validate file size
  if (fileSizeBytes === null || fileSizeBytes <= 0) {
    return NextResponse.json(
      { error: "File size must be a positive number." },
      { status: 400 }
    );
  }
  if (fileSizeBytes > MAX_UPLOAD_BYTES) {
    const mb = (fileSizeBytes / (1024 * 1024)).toFixed(1);
    return NextResponse.json(
      { error: `File too large (${mb} MB). Maximum allowed size is 10 MB.` },
      { status: 400 }
    );
  }

  // 6. Verify AWS credentials are configured
  if (
    !process.env.AWS_REGION ||
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY ||
    !process.env.AWS_S3_BUCKET_NAME
  ) {
    console.error("[presign] AWS environment variables are not configured.");
    return NextResponse.json(
      { error: "Upload service is not configured. Contact support." },
      { status: 503 }
    );
  }

  // 7. Build a unique, server-controlled S3 object key
  //    Format: users/{clerkUserId}/analyses/{uuid}/{sanitised-filename}
  const uuid = randomUUID();
  // Strip anything that isn't alphanumeric, hyphen, underscore, or dot
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const s3Key = `users/${userId}/analyses/${uuid}/${safeFilename}`;

  // 8. Generate a presigned PUT URL (expires in 5 minutes)
  try {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300, // 5 minutes
    });

    return NextResponse.json({ uploadUrl, s3Key });
  } catch (err) {
    console.error("[presign] Failed to generate presigned URL:", err);
    return NextResponse.json(
      { error: "Failed to generate upload URL. Please try again." },
      { status: 500 }
    );
  }
}
