import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Analysis from "@/models/Analysis";

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
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
