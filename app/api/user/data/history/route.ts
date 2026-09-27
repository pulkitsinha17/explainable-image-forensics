import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Analysis from "@/models/Analysis";
import { checkRateLimit } from "@/lib/rate-limit";

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Rate limit: 5 requests per minute per user for history wipe
  const rateLimit = checkRateLimit(`delete-hist:${userId}`, { maxRequests: 5, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many delete requests. Please wait a moment." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateLimit.resetMs / 1000)),
        },
      }
    );
  }

  try {
    await connectToDatabase();
    const result = await Analysis.deleteMany({ clerkUserId: userId });

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: "Analysis history deleted successfully.",
    });
  } catch (error) {
    console.error("[api/user/data/history] Failed to delete analysis history:", error);
    return NextResponse.json(
      { error: "Failed to delete analysis history. Please try again." },
      { status: 500 }
    );
  }
}
