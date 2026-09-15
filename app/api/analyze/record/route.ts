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

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: { filename?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const filename =
    typeof body.filename === "string" ? body.filename.trim() : null;
  if (!filename) {
    return NextResponse.json(
      { error: "filename is required." },
      { status: 400 }
    );
  }

  await connectToDatabase();

  const record = await Analysis.create({
    clerkUserId: userId,
    originalFilename: filename,
    status: "pending",
  });

  return NextResponse.json({ analysisId: String(record._id) });
}
