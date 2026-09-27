/**
 * API Routes: /api/feedback
 *
 * POST: Submit or update user feedback for an analysis.
 * GET: Retrieve feedback submitted by the authenticated user for a specific analysisId.
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import Analysis from "@/models/Analysis";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Rate limit: max 30 feedback submissions per minute per user
  const rateLimit = checkRateLimit(`feedback:${userId}`, { maxRequests: 30, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many feedback submissions. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateLimit.resetMs / 1000)),
        },
      }
    );
  }

  let body: { analysisId?: unknown; rating?: unknown; comment?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const analysisId = typeof body.analysisId === "string" ? body.analysisId.trim() : null;
  const rating = typeof body.rating === "string" ? body.rating.trim() : null;
  const comment = typeof body.comment === "string" ? body.comment.trim() : undefined;

  if (!analysisId) {
    return NextResponse.json({ error: "analysisId is required." }, { status: 400 });
  }

  if (rating !== "useful" && rating !== "not_useful") {
    return NextResponse.json(
      { error: "rating must be either 'useful' or 'not_useful'." },
      { status: 400 }
    );
  }

  if (comment && comment.length > 1000) {
    return NextResponse.json(
      { error: "comment must not exceed 1000 characters." },
      { status: 400 }
    );
  }

  await connectToDatabase();

  // Validate that the analysis exists AND belongs to this user
  try {
    const analysis = await Analysis.findOne({ _id: analysisId, clerkUserId: userId }).select("_id").lean();
    if (!analysis) {
      // Return 404 regardless of whether analysis doesn't exist or belongs to another user
      // to avoid leaking the existence of other users' analyses
      return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
    }
  } catch {
    // If analysisId is not a valid ObjectId
    return NextResponse.json({ error: "Invalid analysis ID." }, { status: 400 });
  }

  // Upsert feedback record
  const updatedFeedback = await Feedback.findOneAndUpdate(
    { clerkUserId: userId, analysisId },
    {
      $set: {
        rating,
        comment: comment || undefined,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({
    success: true,
    message: "Feedback submitted successfully.",
    feedback: {
      id: String(updatedFeedback._id),
      analysisId: updatedFeedback.analysisId,
      rating: updatedFeedback.rating,
      comment: updatedFeedback.comment,
    },
  });
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const analysisId = searchParams.get("analysisId");

  if (!analysisId) {
    return NextResponse.json({ error: "analysisId is required." }, { status: 400 });
  }

  await connectToDatabase();

  const feedback = await Feedback.findOne({ clerkUserId: userId, analysisId }).lean();
  if (!feedback) {
    return NextResponse.json({ feedback: null });
  }

  return NextResponse.json({
    feedback: {
      rating: feedback.rating,
      comment: feedback.comment,
    },
  });
}
