/**
 * POST /api/analyze/record
 *
 * Creates a new Analysis document in MongoDB BEFORE the S3 upload begins.
 * This gives us an analysisId that we can include in the presign request
 * and later pass to /api/analyze/run.
 *
 * Body (JSON):
 *   { filename: string }
 *
 * Returns:
 *   { analysisId: string }
 */
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Analysis from "@/models/Analysis";
import { getUserUsageAndLimit } from "@/lib/subscription";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Rate limit: 20 records created per minute per user
  const rateLimit = checkRateLimit(`record:${userId}`, { maxRequests: 20, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateLimit.resetMs / 1000)),
        },
      }
    );
  }

  let body: { filename?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawFilename =
    typeof body.filename === "string" ? body.filename.trim() : null;
  if (!rawFilename) {
    return NextResponse.json(
      { error: "filename is required." },
      { status: 400 }
    );
  }

  // Limit filename length and strip path separators to prevent injection
  if (rawFilename.length > 255) {
    return NextResponse.json(
      { error: "filename is too long (max 255 characters)." },
      { status: 400 }
    );
  }
  // Strip directory traversal characters — only keep safe characters
  const filename = rawFilename.replace(/[/\\<>:"|?*\x00-\x1F]/g, "_");

  const isDev = process.env.NODE_ENV === "development";

  await connectToDatabase();

  // Re-check usage limit atomically inside the DB block to minimize race window.
  // (True atomicity would require a MongoDB transaction, but this reduces the race
  // window to a single-digit millisecond range for the free tier limit enforcement.)
  if (!isDev) {
    try {
      const usage = await getUserUsageAndLimit(userId);
      if (usage.isLimitReached) {
        return NextResponse.json(
          {
            error: `Analysis limit reached (${usage.used}/${usage.limit} on ${usage.planName} plan). Please upgrade your plan.`,
            limitReached: true,
          },
          { status: 403 }
        );
      }
    } catch (err) {
      console.error("[analyze/record] Usage check error:", err);
      // Don't block if DB check fails unexpectedly
    }
  }

  const record = await Analysis.create({
    clerkUserId: userId,
    originalFilename: filename,
    status: "pending",
  });

  return NextResponse.json({ analysisId: String(record._id) });
}
