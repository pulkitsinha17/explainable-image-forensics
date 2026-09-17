/**
 * GET /api/history
 *
 * Authenticated endpoint to fetch analysis history and summary statistics
 * for the currently authenticated Clerk user.
 *
 * Security:
 *   - Strictly scoped to auth().userId (no cross-user data leakage).
 *   - Generates pre-signed S3 URLs for thumbnails securely on the server.
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserAnalysisHistory } from "@/lib/history";

export async function GET() {
  // 1. Authenticate user
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // 2. Fetch canonical history & statistics
  try {
    const { records, stats } = await getUserAnalysisHistory(userId);

    return NextResponse.json({
      success: true,
      records,
      stats,
    });
  } catch (error) {
    console.error("[api/history] Failed to fetch history:", error);
    return NextResponse.json(
      { error: "Failed to retrieve analysis history." },
      { status: 500 }
    );
  }
}

