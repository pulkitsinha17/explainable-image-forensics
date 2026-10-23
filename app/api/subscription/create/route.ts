import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";
import Subscription from "@/models/Subscription";
import { getRazorpayClient, getRazorpayPlanId } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to subscribe." },
        { status: 401 }
      );
    }

    let body: { plan?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const { plan } = body;
    if (plan !== "monthly" && plan !== "yearly") {
      return NextResponse.json(
        { error: "Invalid plan. Only 'monthly' and 'yearly' subscriptions are available." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already has an active subscription on this exact plan
    const existingSub = await Subscription.findOne({ clerkUserId: userId });
    if (
      existingSub &&
      existingSub.plan === plan &&
      (existingSub.status === "active" || existingSub.status === "authenticated")
    ) {
      return NextResponse.json(
        {
          error: `You are already subscribed to the ${plan} plan.`,
          alreadySubscribed: true,
        },
        { status: 400 }
      );
    }

    // Retrieve server-side plan ID from environment variables (never client supplied)
    const planId = getRazorpayPlanId(plan);

    // Optional user email/name for prefill and notes
    const clerkUser = await currentUser();
    const primaryEmail =
      clerkUser?.emailAddresses?.find(
        (e) => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress || clerkUser?.emailAddresses?.[0]?.emailAddress;

    // Initialize Razorpay client
    const razorpay = getRazorpayClient();

    // Create subscription in Razorpay
    // total_count: 60 billing cycles for monthly (5 years), 5 for yearly (5 years)
    const totalCount = plan === "monthly" ? 60 : 5;

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: totalCount,
      quantity: 1,
      customer_notify: 1,
      notes: {
        clerkUserId: userId,
        plan: plan,
        userEmail: primaryEmail || "",
      },
    });

    if (!subscription || !subscription.id) {
      throw new Error("Failed to receive subscription ID from Razorpay.");
    }

    // Persist subscription ID and intent in database with status 'created'
    await Subscription.findOneAndUpdate(
      { clerkUserId: userId },
      {
        $set: {
          razorpaySubscriptionId: subscription.id,
          razorpayPlanId: planId,
        },
        $setOnInsert: {
          clerkUserId: userId,
          plan: "free",
          status: "active",
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      plan,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[subscription/create] Error:", error);
    return NextResponse.json(
      { error: message || "Failed to initialize subscription checkout." },
      { status: 500 }
    );
  }
}
