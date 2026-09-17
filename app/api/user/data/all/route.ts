import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Analysis from "@/models/Analysis";
import Feedback from "@/models/Feedback";
import Subscription from "@/models/Subscription";

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
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
