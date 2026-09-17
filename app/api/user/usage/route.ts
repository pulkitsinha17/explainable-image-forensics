import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserUsageAndLimit } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const usage = await getUserUsageAndLimit(userId);
    return NextResponse.json({ success: true, usage });
  } catch (error) {
    console.error("[api/user/usage] Failed to get usage:", error);
    return NextResponse.json(
      { error: "Failed to retrieve usage data." },
      { status: 500 }
    );
  }
}
