import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Analysis from "@/models/Analysis";
import Feedback from "@/models/Feedback";
import Subscription from "@/models/Subscription";
import { checkRateLimit } from "@/lib/rate-limit";

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Rate limit: 5 requests per minute per user for account wipe
  const rateLimit = checkRateLimit(`delete-all:${userId}`, { maxRequests: 5, windowMs: 60_000 });
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
    await Promise.all([
      Analysis.deleteMany({ clerkUserId: userId }),
      Feedback.deleteMany({ clerkUserId: userId }),
      Subscription.deleteMany({ clerkUserId: userId }),
    ]);

    return NextResponse.json({
      success: true,
      message: "All PIXENTRA account data removed successfully.",
    });
  } catch (error) {
    console.error("[api/user/data/all] Failed to delete user data:", error);
    return NextResponse.json(
      { error: "Failed to delete account data. Please try again." },
      { status: 500 }
    );
  }
}
